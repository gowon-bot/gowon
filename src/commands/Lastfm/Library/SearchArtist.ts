import { LogicError } from "../../../errors";
import { numberDisplay } from "../../../helpers";
import { RunAs } from "../../../lib/AliasChecker";
import { Variation } from "../../../lib/command/BaseCommand";
import { Paginator } from "../../../lib/Paginator";
import { SearchCommand } from "./SearchCommand";

export default class SearchArtist extends SearchCommand {
  shouldBeIndexed = true;
  description = "Searches your top artists for keywords";
  variations: Variation[] = [
    {
      variationRegex: /sadeep|sad/,
      friendlyString: "sadeep`,`sad",
      description: "Searches your top 4000 artists (instead of 2000)",
    },
  ];
  aliases = ["sa", "sartist"];
  usage = ["keywords", "keywords @user"];

  async run(_: any, runAs: RunAs) {
    let keywords = this.parsedArguments.keywords as string;

    let { username } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      runAs.variationWasUsed("sadeep", "sad") ? 4 : 2,
      { username, limit: 1000 }
    );

    let topArtists = await paginator.getAll({
      concatTo: "artist",
      concurrent: runAs.variationWasUsed("sadeep", "sad"),
    });

    let filtered = topArtists.artist.filter((a) =>
      this.clean(a.name).includes(this.clean(keywords))
    );

    if (filtered.length !== 0 && filtered.length === topArtists.artist.length) {
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    filtered = filtered.slice(0, 25);

    let embed = this.newEmbed()
      .setTitle(
        `Search results in ${username.code()}'s top ${numberDisplay(
          topArtists.artist.length,
          "artist"
        )}`
      )
      .setDescription(
        filtered.length
          ? `Artists matching ${keywords.code()}
\`\`\`
${filtered.map((f) => `${f["@attr"].rank}.` + f.name).join("\n")}
\`\`\``
          : `No results found for ${keywords.code()}!`
      );

    await this.send(embed);
  }
}
