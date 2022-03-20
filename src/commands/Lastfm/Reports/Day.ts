import { sub } from "date-fns";
import { LogicError } from "../../../errors/errors";
import { italic } from "../../../helpers/discord";
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

export default class Day extends LastFMBaseCommand<typeof args> {
  idSeed = "bvndit seungeun";

  description =
    "Shows an overview of your day, including your top artists, albums, and tracks";
  aliases = ["daily"];
  subcategory = "reports";
  usage = ["", "@user"];

  slashCommand = true;

  arguments = args;

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

    await tagConsolidator.saveServerBannedTagsInContext(this.ctx);
    tagConsolidator.addTags(this.ctx, day.top.tags);

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
    ? `\n${italic(tagConsolidator.consolidateAsStrings(10).join(", "))}\n`
    : ""
}
**Top Tracks**:
${extraWideSpace}${bullet} ${topTracks
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(day.top.tracks[t], "play")})`)
      .join(`\n​${extraWideSpace}${bullet} `)}

**Top Albums**:
${extraWideSpace}${bullet} ${topAlbums
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(day.top.albums[t], "play")})`)
      .join(`\n​${extraWideSpace}${bullet} `)}

**Top Artists**:
${extraWideSpace}${bullet} ${topArtists
      .slice(0, 3)
      .map((t) => `${t} (${displayNumber(day.top.artists[t], "play")})`)
      .join(`\n​${extraWideSpace}${bullet} `)}
    `);

    await this.send(embed);
  }
}
