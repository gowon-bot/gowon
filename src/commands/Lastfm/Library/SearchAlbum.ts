import { TooManySearchResultsError } from "../../../errors/commands/library";
import { code, italic } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { Variation } from "../../../lib/command/Command";
import { Paginator } from "../../../lib/paginators/Paginator";
import {
  displayLink,
  displayNumber,
  displayNumberedList,
  highlightKeywords,
} from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
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

    const { requestable, perspective, username } = await this.getMentions();

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
      throw new TooManySearchResultsError();
    }

    const embed = this.minimalEmbed().setTitle(
      `Search results in ${perspective.possessive} top ${displayNumber(
        topAlbums.albums.length,
        "album"
      )}`
    );

    if (!filtered.length) {
      embed.setDescription(`No results found for ${code(keywords)}!`);
      await this.reply(embed);
      return;
    }

    const scrollingEmbed = new ScrollingListView(this.ctx, embed, {
      items: filtered,
      pageSize: 15,
      pageRenderer(items) {
        return `Albums matching ${code(keywords)}
\n${displayNumberedList(
          items.map((l) => {
            const link = displayLink(
              highlightKeywords(l.name, keywords),
              LastfmLinks.libraryAlbumPage(username, l.artist.name, l.name),
              false
            );

            return {
              value: `${italic(l.artist.name)} - ${link} (${displayNumber(
                l.userPlaycount,
                "play"
              )})`,
              i: l.rank,
            };
          })
        )}`;
      },
      overrides: { itemName: "result" },
    });

    await this.reply(scrollingEmbed);
  }
}
