import { sub } from "date-fns";
import { LogicError } from "../../../errors/errors";
import { italic } from "../../../helpers/discord";
import { toInt } from "../../../helpers/lastfm";
import { bullet, extraWideSpace } from "../../../helpers/specialCharacters";
import { ReportCalculator } from "../../../lib/calculators/ReportCalculator";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Paginator } from "../../../lib/paginators/Paginator";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { displayDate, displayNumber } from "../../../lib/views/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export default class Week extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature belle";

  description =
    "Shows an overview of your week, including your top artists, albums, and tracks";
  aliases = ["weekly"];
  subcategory = "reports";
  usage = ["", "@user"];

  slashCommand = true;

  arguments = args;

  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    let { requestable, perspective, senderUser } = await this.getMentions();

    let paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      4,
      {
        from: ~~(sub(new Date(), { weeks: 1 }).getTime() / 1000),
        to: ~~(new Date().getTime() / 1000),
        username: requestable,
        limit: 1000,
      },
      this.ctx
    );

    let firstPage = await paginator.getNext();

    if (!firstPage || firstPage.meta.total < 1) {
      throw new LogicError(
        `${perspective.plusToHave} don't have any scrobbles in that time period`
      );
    }

    if (senderUser && !senderUser?.isPatron && firstPage.meta.totalPages > 4) {
      throw new LogicError(
        `${perspective.plusToHave} too many scrobbles this week to see an overview!\n\nYou can become a Patron to remove the limit. See \`${this.prefix}patreon\` for more information.`
      );
    }

    paginator.maxPages = toInt(firstPage.meta.totalPages);

    let restPages = await paginator.getAllToConcatonable();

    firstPage.concat(restPages);

    let reportCalculator = new ReportCalculator(this.ctx, firstPage);

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

    const tagConsolidator = new TagConsolidator();

    await tagConsolidator.saveServerBannedTagsInContext(this.ctx);
    tagConsolidator.addTags(this.ctx, week.top.tags);

    let embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor())
      .setTitle(`${perspective.upper.possessive} week`).setDescription(`
      _${displayDate(sub(new Date(), { weeks: 1 }))} - ${displayDate(
      new Date()
    )}_
    _${displayNumber(firstPage.tracks.length, "scrobble")}, ${displayNumber(
      week.total.artists,
      "artist"
    )}, ${displayNumber(week.total.albums, "album")}, ${displayNumber(
      week.total.tracks,
      "track"
    )}_

${italic(tagConsolidator.consolidateAsStrings(10).join(", "))}
  
**Top Tracks**:
${extraWideSpace}${bullet} ${topTracks
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(week.top.tracks[t], "play")})`)
      .join(`\n​${extraWideSpace}${bullet} `)}

**Top Albums**:
${extraWideSpace}${bullet} ${topAlbums
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(week.top.albums[t], "play")})`)
      .join(`\n​${extraWideSpace}${bullet} `)}

**Top Artists**:
${extraWideSpace}${bullet} ${topArtists
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(week.top.artists[t], "play")})`)
      .join(`\n​${extraWideSpace}${bullet} `)}
    `);

    await this.send(embed);
  }
}
