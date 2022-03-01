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

  slashCommand = true;

  variations: Variation[] = [
    {
      name: "deep",
      variation: ["deepsl", "dsl"],
      description: "Searches your top 4000 albums (instead of 2000)",
    },
  ];

  async run() {
    const keywords = this.parsedArguments.keywords;

    const { requestable, perspective } = await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.topAlbums.bind(this.lastFMService),
      this.isDeep() ? 4 : 2,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const topAlbums = await paginator.getAllToConcatonable({
      concurrent: this.isDeep(),
    });

    const filtered = topAlbums.albums.filter((a) =>
      this.clean(a.name).includes(this.clean(keywords))
    );

    if (filtered.length !== 0 && filtered.length === topAlbums.albums.length) {
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Album search"))
      .setTitle(
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

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: filtered,
      pageSize: 15,
      pageRenderer(items) {
        return `Albums matching ${keywords.code()}
\n${items
          .map(
            (l) =>
              `${l.rank}. ${l.artist.name.italic()} - ${l.name.replaceAll(
                new RegExp(`${keywords}`, "gi"),
                (match) => match.strong()
              )} (${displayNumber(l.userPlaycount, "play")})`
          )
          .join("\n")}`;
      },
      overrides: { itemName: "result" },
    });

    scrollingEmbed.send();
  }
}
