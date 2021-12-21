import { LogicError } from "../../../errors";
import { Variation } from "../../../lib/command/BaseCommand";
import { Paginator } from "../../../lib/paginators/Paginator";
import { displayNumber } from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
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
    const keywords = this.parsedArguments.keywords!;

    const { requestable, perspective } = await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      this.variationWasUsed("deep") ? 4 : 2,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const topArtists = await paginator.getAllToConcatonable({
      concurrent: this.variationWasUsed("deep"),
    });

    const filtered = topArtists.artists.filter((a) =>
      this.clean(a.name).includes(this.clean(keywords))
    );

    if (
      filtered.length !== 0 &&
      filtered.length === topArtists.artists.length
    ) {
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Artist search"))
      .setTitle(
        `Search results in ${perspective.possessive} top ${displayNumber(
          topArtists.artists.length,
          "artist"
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
          return `Artists matching ${keywords.code()}
\n${items
            .map(
              (a) =>
                `${a.rank}. ` +
                a.name.replaceAll(new RegExp(`${keywords}`, "gi"), (match) =>
                  match.strong()
                ) +
                ` (${displayNumber(a.userPlaycount, "play")})`
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
