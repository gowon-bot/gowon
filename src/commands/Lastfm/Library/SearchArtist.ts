import { LogicError } from "../../../errors";
import { numberDisplay } from "../../../helpers";
import { Variation } from "../../../lib/command/BaseCommand";
import { Paginator } from "../../../lib/Paginator";
import { SearchCommand } from "./SearchCommand";

export default class SearchArtist extends SearchCommand {
  idSeed = "gwsn minju";

  shouldBeIndexed = true;
  description = "Searches your top artists for keywords";
  aliases = ["sa", "sartist"];
  usage = ["keywords", "keywords @user"];

  variations: Variation[] = [
    {
      name: "deep",
      variation: ["deepsa", "dsa"],
      description: "Searches your top 4000 artists (instead of 2000)",
    },
  ];

  async run() {
    let keywords = this.parsedArguments.keywords!;

    let { username } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      this.variationWasUsed("deep") ? 4 : 2,
      { username, limit: 1000 }
    );

    let topArtists = await paginator.getAll({
      concatTo: "artist",
      concurrent: this.variationWasUsed("deep"),
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
        `Search results in ${username}'s top ${numberDisplay(
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
