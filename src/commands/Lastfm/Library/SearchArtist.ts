import { TooManySearchResultsError } from "../../../errors/commands/library";
import { code } from "../../../helpers/discord";
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
      throw new TooManySearchResultsError();
    }

    const embed = this.minimalEmbed().setTitle(
      `Search results in ${perspective.possessive} top ${displayNumber(
        topArtists.artists.length,
        "artist"
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
        return `Artists matching ${code(keywords)}
\n${displayNumberedList(
          items.map((a) => {
            const link = displayLink(
              highlightKeywords(a.name, keywords),
              LastfmLinks.libraryArtistPage(username, a.name),
              false
            );

            return {
              value: `${link} (${displayNumber(a.userPlaycount, "play")})`,
              i: a.rank,
            };
          })
        )}`;
      },

      overrides: { itemName: "result" },
    });

    await this.reply(scrollingEmbed);
  }
}
