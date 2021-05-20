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

export default class Week extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature belle";
  description =
    "Shows an overview of your week, including your top artists, albums, and tracks";
  aliases = ["weekly"];
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
        from: ~~(sub(new Date(), { weeks: 1 }).getTime() / 1000),
        to: ~~(new Date().getTime() / 1000),
        username,
        limit: 1000,
      }
    );

    let firstPage = await paginator.getNext();

    if (!firstPage || firstPage.meta.total < 1) {
      throw new LogicError(
        `${perspective.plusToHave} don't have any scrobbles in that time period`
      );
    }

    if (firstPage.meta.totalPages > 4) {
      throw new LogicError(
        `${perspective.plusToHave} too many scrobbles this week to see an overview!`
      );
    }

    paginator.maxPages = toInt(firstPage.meta.totalPages);

    let restPages = await paginator.getAllToConcatonable();

    firstPage.concat(restPages);

    let reportCalculator = new ReportCalculator(
      this.redirectsService,
      firstPage
    );

    let week = await reportCalculator.calculate();

    let topTracks = Object.keys(week.top.tracks).sort(
      (a, b) => week.top.tracks[b] - week.top.tracks[a]
    );

    let topAlbums = Object.keys(week.top.albums).sort(
      (a, b) => week.top.albums[b] - week.top.albums[a]
    );

    let topArtists = Object.keys(week.top.artists).sort(
      (a, b) => week.top.artists[b] - week.top.artists[a]
    );

    let embed = this.newEmbed().setTitle(`${username}'s week`).setDescription(`
      _${dateDisplay(sub(new Date(), { weeks: 1 }))} - ${dateDisplay(
      new Date()
    )}_
    _${numberDisplay(firstPage.tracks.length, "scrobble")}, ${numberDisplay(
      week.total.artists,
      "artist"
    )}, ${numberDisplay(week.total.albums, "album")}, ${numberDisplay(
      week.total.tracks,
      "track"
    )}_
  
**Top Tracks**:
 • ${topTracks
      .slice(0, 3)
      .map((t) => `${t} (${numberDisplay(week.top.tracks[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}

**Top Albums**:
 • ${topAlbums
      .slice(0, 3)
      .map((t) => `${t} (${numberDisplay(week.top.albums[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}

**Top Artists**:
 • ${topArtists
      .slice(0, 3)
      .map((t) => `${t} (${numberDisplay(week.top.artists[t], "play")})`)
      // These are special spaces
      .join("\n​ • ")}
    `);

    await this.send(embed);
  }
}
