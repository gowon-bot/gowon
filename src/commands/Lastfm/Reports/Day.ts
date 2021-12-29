import { sub } from "date-fns";
import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { ReportCalculator } from "../../../lib/calculators/ReportCalculator";
import { Paginator } from "../../../lib/paginators/Paginator";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { displayDate, displayNumber } from "../../../lib/views/displays";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  mentions: standardMentions,
} as const;

export default class Day extends LastFMBaseCommand<typeof args> {
  idSeed = "bvndit seungeun";
  description =
    "Shows an overview of your day, including your top artists, albums, and tracks";
  aliases = ["daily"];
  subcategory = "reports";
  usage = ["", "@user"];

  arguments: Arguments = args;

  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    const { requestable, perspective, senderUser } = await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      4,
      {
        from: ~~(sub(new Date(), { days: 1 }).getTime() / 1000),
        to: ~~(new Date().getTime() / 1000),
        username: requestable,
        limit: 1000,
      },
      this.ctx
    );

    const firstPage = await paginator.getNext();

    if (!firstPage || firstPage.meta.total < 1) {
      throw new LogicError(
        `${perspective.plusToHave} don't have any scrobbles in that time period`
      );
    }

    if (senderUser && !senderUser?.isPatron && firstPage.meta.totalPages > 4) {
      throw new LogicError(
        `${perspective.plusToHave} too many scrobbles today to see an overview!\n\nYou can become a Patron to remove the limit. See \`${this.prefix}patreon\` for more information.`
      );
    }

    paginator.maxPages = firstPage.meta.totalPages;

    const restPages = await paginator.getAllToConcatonable();

    firstPage.concat(restPages);

    const reportCalculator = new ReportCalculator(this.ctx, firstPage);

    const day = await reportCalculator.calculate();

    const topTracks = Object.keys(day.top.tracks).sort(
      (a, b) => day.top.tracks[b] - day.top.tracks[a]
    );

    const topAlbums = Object.keys(day.top.albums).sort(
      (a, b) => day.top.albums[b] - day.top.albums[a]
    );

    const topArtists = Object.keys(day.top.artists).sort(
      (a, b) => day.top.artists[b] - day.top.artists[a]
    );

    const tagConsolidator = new TagConsolidator();

    tagConsolidator.addTags(day.top.tags);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor())
      .setTitle(`${perspective.upper.possessive} day`).setDescription(`
      _${displayDate(sub(new Date(), { days: 1 }))} - ${displayDate(
      new Date()
    )}_
    _${displayNumber(firstPage.tracks.length, "scrobble")}, ${displayNumber(
      day.total.artists,
      "artist"
    )}, ${displayNumber(day.total.albums, "album")}, ${displayNumber(
      day.total.tracks,
      "track"
    )}_
${
  tagConsolidator.hasAnyTags()
    ? `\n${tagConsolidator.consolidateAsStrings(10).join(", ").italic()}\n`
    : ""
}
**Top Tracks**:
 • ${topTracks
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(day.top.tracks[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}

**Top Albums**:
 • ${topAlbums
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(day.top.albums[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}

**Top Artists**:
 • ${topArtists
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(day.top.artists[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}
    `);

    await this.send(embed);
  }
}
