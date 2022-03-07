import { sub } from "date-fns";
import { LogicError } from "../../../errors/errors";
import { bullet, extraWideSpace } from "../../../helpers/specialCharacters";
import { ReportCalculator } from "../../../lib/calculators/ReportCalculator";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { Paginator } from "../../../lib/paginators/Paginator";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { displayDate, displayNumber } from "../../../lib/views/displays";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
} as const;

export default class Month extends LastFMBaseCommand<typeof args> {
  idSeed = "exid hani";

  description =
    "Shows an overview of your month, including your top artists, albums, and tracks";
  aliases = ["monthly"];
  subcategory = "reports";
  usage = ["", "@user"];

  slashCommand = true;

  arguments = args;

  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    const { requestable, perspective, senderUser } = await this.getMentions();

    const paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      6,
      {
        from: ~~(sub(new Date(), { months: 1 }).getTime() / 1000),
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

    if (senderUser && !senderUser?.isPatron && firstPage.meta.totalPages > 6) {
      throw new LogicError(
        `${perspective.plusToHave} too many scrobbles this month to see an overview!\n\nYou can become a Patron to remove the limit. See \`${this.prefix}patreon\` for more information.`
      );
    }
    paginator.maxPages = firstPage.meta.totalPages;

    const restPages = await paginator.getAllToConcatonable();

    firstPage.concat(restPages);

    const reportCalculator = new ReportCalculator(this.ctx, firstPage);

    const month = await reportCalculator.calculate();

    const topTracks = Object.keys(month.top.tracks).sort(
      (a, b) => month.top.tracks[b] - month.top.tracks[a]
    );

    const topAlbums = Object.keys(month.top.albums).sort(
      (a, b) => month.top.albums[b] - month.top.albums[a]
    );

    const topArtists = Object.keys(month.top.artists).sort(
      (a, b) => month.top.artists[b] - month.top.artists[a]
    );

    const tagConsolidator = new TagConsolidator();

    await tagConsolidator.saveServerBannedTagsInContext(this.ctx);
    tagConsolidator.addTags(this.ctx, month.top.tags);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor())
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

${tagConsolidator.consolidateAsStrings(10).join(", ").italic()}
  
**Top Tracks**:
${extraWideSpace}${bullet} ${topTracks
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(month.top.tracks[t], "play")})`)
      .join(`\n​${extraWideSpace}${bullet} `)}

**Top Albums**:
${extraWideSpace}${bullet} ${topAlbums
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(month.top.albums[t], "play")})`)
      .join(`\n​${extraWideSpace}${bullet} `)}

**Top Artists**:
${extraWideSpace}${bullet} ${topArtists
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(month.top.artists[t], "play")})`)
      .join(`\n​${extraWideSpace}${bullet} `)}
    `);

    await this.send(embed);
  }
}
