import { LogicError } from "../../../errors";
import { Variation } from "../../../lib/command/BaseCommand";
import { Paginator } from "../../../lib/paginators/Paginator";
import { displayNumber } from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { SearchCommand } from "./SearchCommand";

export default class SearchAlbum extends SearchCommand {
  idSeed = "gwsn miya";

  shouldBeIndexed = true;
  description = "Searches your top albums for keywords";
  aliases = ["sl", "sal", "salbum"];
  usage = ["keywords", "keywords @user"];

  variations: Variation[] = [
    {
      name: "deep",
      variation: ["deepsl", "dsl"],
      description: "Searches your top 4000 albums (instead of 2000)",
    },
  ];

  async run() {
    const keywords = this.parsedArguments.keywords!;

    const { requestable, perspective } = await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.topAlbums.bind(this.lastFMService),
      this.variationWasUsed("deep") ? 4 : 2,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const topAlbums = await paginator.getAllToConcatonable({
      concurrent: this.variationWasUsed("deep"),
    });

    const filtered = topAlbums.albums.filter((a) =>
      this.clean(a.name).includes(this.clean(keywords))
    );

    if (filtered.length !== 0 && filtered.length === topAlbums.albums.length) {
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    const embed = this.newEmbed().setTitle(
      `Search results in ${perspective.possessive} top ${displayNumber(
        topAlbums.albums.length,
        "album"
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
          return `Albums matching ${keywords.code()}
\`\`\`\n${items
            .map((l) => `${l.rank}. ${l.artist.name} - ${l.name}`)
            .join("\n")}\`\`\``;
        },
      },
      {
        itemName: "result",
      }
    );

    scrollingEmbed.send();
  }
}
