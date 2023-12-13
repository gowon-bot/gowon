import { LogicError } from "../../../errors/errors";
import { bold, code, italic } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { Variation } from "../../../lib/command/Command";
import { Paginator } from "../../../lib/paginators/Paginator";
import { displayLink, displayNumber } from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
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
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    const embed = this.authorEmbed()
      .setHeader("Track search")
      .setTitle(
        `Search results in ${perspective.possessive} top ${displayNumber(
          topTracks.tracks.length,
          "track"
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
        return `Tracks matching ${code(keywords)}
\n${items
          .map(
            (t) =>
              `\`${t.rank}\`. ${italic(t.artist.name)} - ${displayLink(
                t.name.replaceAll(new RegExp(`${keywords}`, "gi"), (match) =>
                  bold(match)
                ),
                LastfmLinks.libraryTrackPage(username, t.artist.name, t.name),
                false
              )} (${displayNumber(t.userPlaycount, "play")})`
          )
          .join("\n")}`;
      },

      overrides: { itemName: "result" },
    });

    await this.send(scrollingEmbed);
  }
}
