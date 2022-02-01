import { LogicError } from "../../../errors";
import { Variation } from "../../../lib/command/BaseCommand";
import { Paginator } from "../../../lib/paginators/Paginator";
import { displayNumber } from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
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
    const keywords = this.parsedArguments.keywords!;

    const { requestable, perspective } = await this.parseMentions();

    const paginator = new Paginator(
      this.lastFMService.topTracks.bind(this.lastFMService),
      this.variationWasUsed("deep") ? 6 : 3,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const topTracks = await paginator.getAllToConcatonable({
      concurrent: this.variationWasUsed("deep"),
    });

    const filtered = topTracks.tracks.filter((t) =>
      this.clean(t.name).includes(this.clean(keywords))
    );

    if (filtered.length !== 0 && filtered.length === topTracks.tracks.length) {
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Track search"))
      .setTitle(
        `Search results in ${perspective.possessive} top ${displayNumber(
          topTracks.tracks.length,
          "track"
        )}`
      );

    if (!filtered.length) {
      embed.setDescription(`No results found for ${keywords.code()}!`);
      await this.send(embed);
      return;
    }

    const scrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: filtered,
        pageSize: 15,
        pageRenderer(items) {
          return `Tracks matching ${keywords.code()}
\n${items
            .map(
              (t) =>
                `\`${t.rank}\`. ${t.artist.name.italic()} - ${t.name.replaceAll(
                  new RegExp(`${keywords}`, "gi"),
                  (match) => match.strong()
                )} (${displayNumber(t.userPlaycount, "play")})`
            )
            .join("\n")}`;
        },
      },
      {
        itemName: "result",
      }
    );

    scrollingEmbed.send();
  }
}
