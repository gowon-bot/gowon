import { LogicError } from "../../../errors";
import { Variation } from "../../../lib/command/BaseCommand";
import { Paginator } from "../../../lib/Paginator";
import { displayNumber } from "../../../lib/views/displays";
import { SearchCommand } from "./SearchCommand";

export default class SearchTrack extends SearchCommand {
  idSeed = "gwsn seoryoung";

  shouldBeIndexed = true;
  description = "Searches your top tracks for keywords";
  aliases = ["st", "str", "strack"];
  usage = ["keywords", "keywords @user"];

  variations: Variation[] = [
    {
      name: "deep",
      variation: ["deepst", "dst"],
      description: "Searches your top 6000 tracks (instead of 3000)",
    },
  ];

  async run() {
    let keywords = this.parsedArguments.keywords!;

    const { requestable, perspective } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.topTracks.bind(this.lastFMService),
      this.variationWasUsed("deep") ? 6 : 3,
      { username: requestable, limit: 1000 }
    );

    let topTracks = await paginator.getAllToConcatonable({
      concurrent: this.variationWasUsed("deep"),
    });

    let filtered = topTracks.tracks.filter((t) =>
      this.clean(t.name).includes(this.clean(keywords))
    );

    if (filtered.length !== 0 && filtered.length === topTracks.tracks.length) {
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    let embed = this.newEmbed()
      .setTitle(
        `Search results in ${perspective.possessive} top ${displayNumber(
          topTracks.tracks.length,
          "track"
        )}`
      )
      .setDescription(
        filtered.length
          ? `Tracks matching ${keywords.code()}
\`\`\`
${filtered
  .slice(0, 25)
  .map((t) => `${t.rank}. ${t.artist.name} - ${t.name}`)
  .join("\n")}
\`\`\``
          : `No results found for ${keywords.code()}!`
      );

    await this.send(embed);
  }
}
