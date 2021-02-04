import { LogicError } from "../../../errors";
import { numberDisplay } from "../../../helpers";
import { Variation } from "../../../lib/command/BaseCommand";
import { RunAs } from "../../../lib/command/RunAs";
import { Paginator } from "../../../lib/Paginator";
import { SearchCommand } from "./SearchCommand";

export default class SearchAlbum extends SearchCommand {
  idSeed = "gwsn miya";

  shouldBeIndexed = true;
  description = "Searches your top albums for keywords";
  aliases = ["sl", "sal", "salbum"];
  usage = ["keywords", "keywords @user"];

  variations: Variation[] = [
    {
      variationRegex: /deepsl|dsl/,
      friendlyString: "deepsl`,`dsl",
      description: "Searches your top 4000 albums (instead of 2000)",
    },
  ];

  async run(_: any, runAs: RunAs) {
    let keywords = this.parsedArguments.keywords!;

    let { username } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.topAlbums.bind(this.lastFMService),
      runAs.variationWasUsed("deepsl", "dsl") ? 4 : 2,
      { username, limit: 1000 }
    );

    let topAlbums = await paginator.getAll({
      concatTo: "album",
      concurrent: runAs.variationWasUsed("deepsl", "dsl"),
    });

    let filtered = topAlbums.album.filter((a) =>
      this.clean(a.name).includes(this.clean(keywords))
    );

    if (filtered.length !== 0 && filtered.length === topAlbums.album.length) {
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    let embed = this.newEmbed()
      .setTitle(
        `Search results in ${username}'s top ${numberDisplay(
          topAlbums.album.length,
          "album"
        )}`
      )
      .setDescription(
        filtered.length
          ? `Albums matching ${keywords.code()}
\`\`\`
${filtered
  .slice(0, 25)
  .map((l) => `${l["@attr"].rank}. ${l.artist.name} - ${l.name}`)
  .join("\n")}
\`\`\``
          : `No results found for ${keywords.code()}!`
      );

    await this.send(embed);
  }
}
