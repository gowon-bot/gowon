import { sub } from "date-fns";
import { LogicError } from "../../../../errors/errors";
import { italic } from "../../../../helpers/discord";
import { bullet, extraWideSpace } from "../../../../helpers/specialCharacters";
import { SimpleMap } from "../../../../helpers/types";
import { ReportCalculator } from "../../../../lib/calculators/ReportCalculator";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { MirrorballPaginator } from "../../../../lib/paginators/MirrorballPaginator";
import { TagConsolidator } from "../../../../lib/tags/TagConsolidator";
import { displayDate, displayNumber } from "../../../../lib/views/displays";
import { RecentTracks } from "../../../../services/LastFM/converters/RecentTracks";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { RedirectsService } from "../../../../services/dbservices/RedirectsService";
import { YearConnector, YearParams, YearResponse } from "./Year.connector";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

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

  devCommand = true;

  arguments = args;

  connector = new YearConnector();
  redirectsService = ServiceRegistry.get(RedirectsService);

  private readonly pageSize = 5000;

  async run() {
    const { dbUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
      indexedRequired: true,
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

    await tagConsolidator.saveBannedTagsInContext(this.ctx);

    tagConsolidator.addTags(this.ctx, month.top.tags);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor())
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

${italic(tagConsolidator.consolidateAsStrings(10).join(", "))}
  
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

  private async queryAndConvert(
    _: SimpleMap,
    params: YearParams
  ): Promise<RecentTracks> {
    const response = await this.query(params);

    return RecentTracks.fromMirrorballPlaysResponse(response, this.pageSize);
  }
}
