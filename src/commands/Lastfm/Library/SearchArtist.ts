import { LogicError } from "../../../errors/errors";
import { bold, code } from "../../../helpers/discord";
import { LinkGenerator } from "../../../helpers/lastFM";
import { Variation } from "../../../lib/command/Command";
import { Paginator } from "../../../lib/paginators/Paginator";
import { displayLink, displayNumber } from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { SearchCommand } from "./SearchCommand";

export default class SearchArtist extends SearchCommand {
  idSeed = "gwsn minju";

  shouldBeIndexed = true;
  description = "Searches your top artists for keywords";
  aliases = ["sa", "sartist"];
  usage = ["keywords", "keywords @user"];

  slashCommand = true;

  variations: Variation[] = [
    {
      name: "deep",
      variation: ["deepsa", "dsa"],
      description: "Searches your top 4000 artists (instead of 2000)",
    },
  ];

  async run() {
    const keywords = this.parsedArguments.keywords;

    const { requestable, perspective, username } = await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      this.isDeep() ? 4 : 2,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const topArtists = await paginator.getAllToConcatonable({
      concurrent: this.isDeep(),
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
      embed.setDescription(`No results found for ${code(keywords)}!`);
      await this.send(embed);
      return;
    }

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: filtered,
      pageSize: 15,
      pageRenderer(items) {
        return `Artists matching ${code(keywords)}
\n${items
          .map(
            (a) =>
              `${a.rank}. ` +
              displayLink(
                a.name.replaceAll(new RegExp(`${keywords}`, "gi"), (match) =>
                  bold(match)
                ),
                LinkGenerator.libraryArtistPage(username, a.name),
                false
              ) +
              ` (${displayNumber(a.userPlaycount, "play")})`
          )
          .join("\n")}`;
      },

      overrides: { itemName: "result" },
    });

    scrollingEmbed.send();
  }
}
