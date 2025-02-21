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

export default class SearchTrack extends SearchCommand {
  idSeed = "gwsn seoryoung";

  shouldBeIndexed = true;
  description = "Searches your top tracks for keywords";
  aliases = ["st", "str", "strack"];
  usage = ["keywords", "keywords @user"];

  slashCommand = true;

  variations: Variation[] = [
    {
      name: "deep",
      variation: ["deepst", "dst"],
      description: "Searches your top 6000 tracks (instead of 3000)",
    },
  ];

  async run() {
    const keywords = this.parsedArguments.keywords;

    const { requestable, perspective, username } = await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.topTracks.bind(this.lastFMService),
      this.isDeep() ? 6 : 3,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const topTracks = await paginator.getAllToConcatonable({
      concurrent: this.isDeep(),
    });

    const filtered = topTracks.tracks.filter((t) =>
      this.clean(t.name).includes(this.clean(keywords))
    );

    if (filtered.length !== 0 && filtered.length === topTracks.tracks.length) {
      throw new TooManySearchResultsError();
    }

    const embed = this.minimalEmbed().setTitle(
      `Search results in ${perspective.possessive} top ${displayNumber(
        topTracks.tracks.length,
        "track"
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
        return `Tracks matching ${code(keywords)}
\n${displayNumberedList(
          items.map((t) => {
            const link = displayLink(
              highlightKeywords(t.name, keywords),
              LastfmLinks.libraryTrackPage(username, t.artist.name, t.name),
              false
            );

            return {
              value: `${italic(t.artist.name)} - ${link} (${displayNumber(
                t.userPlaycount,
                "play"
              )})`,
              i: t.rank,
            };
          })
        )}`;
      },

      overrides: { itemName: "result" },
    });

    await this.reply(scrollingEmbed);
  }
}
