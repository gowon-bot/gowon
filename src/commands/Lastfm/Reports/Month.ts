import { sub } from "date-fns";
import { LogicError } from "../../../errors";
import { dateDisplay, numberDisplay } from "../../../helpers";
import { toInt } from "../../../helpers/lastFM";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { ReportCalculator } from "../../../lib/calculators/ReportCalculator";
import { Paginator } from "../../../lib/Paginator";
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
    let { username, perspective } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      4,
      {
        from: ~~(sub(new Date(), { months: 1 }).getTime() / 1000),
        to: ~~(new Date().getTime() / 1000),
        username,
        limit: 1000,
      }
    );

    let firstPage = await paginator.getNext();

    if (toInt(firstPage!["@attr"].totalPages) > 6)
      throw new LogicError(
        `${perspective.plusToHave} too many scrobbles this month to see an overview!`
      );

    paginator.maxPages = toInt(firstPage!["@attr"].totalPages);

    let restPages = await paginator.getAll({ concatTo: "track" });

    restPages.track = [...firstPage!.track, ...(restPages.track ?? [])];

    let reportCalculator = new ReportCalculator(
      this.redirectsService,
      restPages
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

    let embed = this.newEmbed().setTitle(`${username}'s month`).setDescription(`
      _${dateDisplay(sub(new Date(), { months: 1 }))} - ${dateDisplay(
      new Date()
    )}_
    _${numberDisplay(restPages.track.length, "scrobble")}, ${numberDisplay(
      month.total.artists,
      "artist"
    )}, ${numberDisplay(month.total.albums, "album")}, ${numberDisplay(
      month.total.tracks,
      "track"
    )}_
  
**Top Tracks**:
 • ${topTracks
      .slice(0, 3)
      .map((t) => `${t} (${numberDisplay(month.top.tracks[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}

**Top Albums**:
 • ${topAlbums
      .slice(0, 3)
      .map((t) => `${t} (${numberDisplay(month.top.albums[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}

**Top Artists**:
 • ${topArtists
      .slice(0, 3)
      .map((t) => `${t} (${numberDisplay(month.top.artists[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}
    `);

    await this.send(embed);
  }
}
