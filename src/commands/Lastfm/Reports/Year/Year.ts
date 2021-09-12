import { sub } from "date-fns";
import { LogicError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { ReportCalculator } from "../../../../lib/calculators/ReportCalculator";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { MirrorballPaginator } from "../../../../lib/paginators/MirrorballPaginator";
import { TagConsolidator } from "../../../../lib/tags/TagConsolidator";
import { displayDate, displayNumber } from "../../../../lib/views/displays";
import { RedirectsService } from "../../../../services/dbservices/RedirectsService";
import { RecentTracks } from "../../../../services/LastFM/converters/RecentTracks";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { YearConnector, YearParams, YearResponse } from "./Year.connector";

const args = {
  mentions: standardMentions,
} as const;

export default class Year extends MirrorballBaseCommand<
  YearResponse,
  YearParams,
  typeof args
> {
  idSeed = "wonder girls yubin";
  description =
    "Shows an overview of your year, including your top artists, albums, and tracks";
  aliases = ["yearly"];
  subcategory = "reports";
  usage = ["", "@user"];

  arguments: Arguments = args;

  connector = new YearConnector();
  redirectsService = ServiceRegistry.get(RedirectsService);

  private readonly pageSize = 5000;

  async run() {
    const { dbUser, discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
      requireIndexed: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const paginator = new MirrorballPaginator(
      this.queryAndConvert.bind(this),
      this.pageSize,
      Infinity,
      {
        playsInput: {
          user: {
            discordID: dbUser.discordID,
          },
          timerange: {
            from: `${~~(sub(new Date(), { years: 1 }).getTime() / 1000)}`,
            to: `${~~(new Date().getTime() / 1000)}`,
          },
        },
      },
      this.ctx
    );

    const firstPage = await paginator.getNext();

    if (!firstPage || firstPage.meta.total < 1) {
      throw new LogicError(
        `${perspective.plusToHave} don't have any scrobbles in that time period`
      );
    }

    paginator.maxPages = firstPage.meta.totalPages;

    const restPages = await paginator.getAllToConcatonable({
      concurrent: false,
    });

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

    tagConsolidator.addTags(month.top.tags);

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor())
      .setTitle(`${perspective.upper.possessive} year`).setDescription(`
      _${displayDate(sub(new Date(), { years: 1 }))} - ${displayDate(
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

  private async queryAndConvert(params: YearParams): Promise<RecentTracks> {
    const response = await this.query(params);

    return RecentTracks.fromMirrorballPlaysResponse(response, this.pageSize);
  }
}
