import { sub } from "date-fns";
import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { ReportCalculator } from "../../../lib/calculators/ReportCalculator";
import { Paginator } from "../../../lib/Paginator";
import { displayDate, displayNumber } from "../../../lib/views/displays";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  mentions: standardMentions,
} as const;

export default class Month extends LastFMBaseCommand<typeof args> {
  idSeed = "exid hani";
  description =
    "Shows an overview of your month, including your top artists, albums, and tracks";
  aliases = ["monthly"];
  subcategory = "reports";
  usage = ["", "@user"];

  arguments: Arguments = args;

  redirectsService = new RedirectsService(this.logger);

  async run() {
    let { requestable, perspective } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      4,
      {
        from: ~~(sub(new Date(), { months: 1 }).getTime() / 1000),
        to: ~~(new Date().getTime() / 1000),
        username: requestable,
        limit: 1000,
      }
    );

    let firstPage = await paginator.getNext();

    if (!firstPage || firstPage.meta.total < 1) {
      throw new LogicError(
        `${perspective.plusToHave} don't have any scrobbles in that time period`
      );
    }

    if (firstPage.meta.totalPages > 6)
      throw new LogicError(
        `${perspective.plusToHave} too many scrobbles this month to see an overview!`
      );

    paginator.maxPages = firstPage.meta.totalPages;

    let restPages = await paginator.getAllToConcatonable();

    firstPage.concat(restPages);

    let reportCalculator = new ReportCalculator(
      this.redirectsService,
      firstPage
    );

    let month = await reportCalculator.calculate();

    let topTracks = Object.keys(month.top.tracks).sort(
      (a, b) => month.top.tracks[b] - month.top.tracks[a]
    );

    let topAlbums = Object.keys(month.top.albums).sort(
      (a, b) => month.top.albums[b] - month.top.albums[a]
    );

    let topArtists = Object.keys(month.top.artists).sort(
      (a, b) => month.top.artists[b] - month.top.artists[a]
    );

    let embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor())
      .setTitle(`${perspective.upper.possessive} month`).setDescription(`
      _${displayDate(sub(new Date(), { months: 1 }))} - ${displayDate(
      new Date()
    )}_
    _${displayNumber(firstPage.tracks.length, "scrobble")}, ${displayNumber(
      month.total.artists,
      "artist"
    )}, ${displayNumber(month.total.albums, "album")}, ${displayNumber(
      month.total.tracks,
      "track"
    )}_
  
**Top Tracks**:
 • ${topTracks
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(month.top.tracks[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}

**Top Albums**:
 • ${topAlbums
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(month.top.albums[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}

**Top Artists**:
 • ${topArtists
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(month.top.artists[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}
    `);

    await this.send(embed);
  }
}
