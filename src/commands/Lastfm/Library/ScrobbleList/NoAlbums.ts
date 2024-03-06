import { bold, italic } from "../../../../helpers/discord";
import { LastfmLinks } from "../../../../helpers/lastfm/LastfmLinks";
import { convertLilacDate } from "../../../../helpers/lilac";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Emoji } from "../../../../lib/emoji/Emoji";
import { LilacBaseCommand } from "../../../../lib/Lilac/LilacBaseCommand";
import { PaginatedLilacScrobbleCache } from "../../../../lib/paginators/PaginatedScrobbleCache";
import { displayDateTime, displayLink } from "../../../../lib/ui/displays";
import { ErrorEmbed } from "../../../../lib/ui/embeds/ErrorEmbed";
import { recommendUserToSetTimezone } from "../../../../services/lilac/helpers";
import {
  LilacScrobble,
  LilacScrobbleFilters,
} from "../../../../services/lilac/LilacAPIService.types";
import { LilacLibraryService } from "../../../../services/lilac/LilacLibraryService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { TimeAndDateService } from "../../../../services/TimeAndDateService";

const args = {
  ...standardMentions,
  ...prefabArguments.artist,
} satisfies ArgumentsMap;

export default class NoAlbums extends LilacBaseCommand<typeof args> {
  idSeed = "brave girls yuna";
  aliases = ["noal", "noalb"];

  subcategory = "library";
  description = "Lists all your scrobbles without an album";

  arguments = args;

  // slashCommand = true;
  pageSize = 15;

  lilacLibraryService = ServiceRegistry.get(LilacLibraryService);
  timeAndDateService = ServiceRegistry.get(TimeAndDateService);

  async run() {
    const { dbUser, perspective, username } = await this.getMentions({
      senderRequired: !this.parsedArguments.artist,
      reverseLookup: { required: true },
      syncedRequired: true,
      backerRequired: true,
    });

    const timeZone = await this.timeAndDateService.saveUserTimeZoneInContext(
      this.ctx,
      this.author.id
    );

    const artistName = this.parsedArguments.artist;

    const params: LilacScrobbleFilters = {
      user: { discordID: dbUser.discordID },
      artist: artistName ? { name: artistName } : {},
      album: { name: "" },
    };

    const scrobbleCache = new PaginatedLilacScrobbleCache(this.ctx, params);

    const firstPage = await scrobbleCache.getFirstPage();

    const embed = this.minimalEmbed().setTitle(
      `${Emoji.usesIndexedDataTitle} ${perspective.upper.possessive} scrobbles with no albums`
    );

    if (firstPage.pagination.totalItems === 0) {
      await this.reply(
        new ErrorEmbed().setDescription(
          `You don't have any scrobbles without an album${
            artistName ? ` from ${bold(artistName)}` : ""
          }!`
        )
      );
      return;
    }

    const scrollingEmbed = await scrobbleCache.generateScrollingEmbed(
      embed,
      firstPage,
      this.displayScrobbleGenerator(username),
      { customFooter: !timeZone ? recommendUserToSetTimezone(this.prefix) : "" }
    );

    await this.reply(scrollingEmbed);
  }

  private displayScrobbleGenerator(
    username: string
  ): (s: LilacScrobble) => string {
    return (s: LilacScrobble) => {
      const scrobbledAt = convertLilacDate(s.scrobbledAt);

      return `${displayLink(
        displayDateTime(scrobbledAt),
        LastfmLinks.libraryWithDateRange(
          username,
          this.timeAndDateService.applyUserTimeZoneFromContext(
            this.ctx,
            scrobbledAt
          ),
          "1day"
        )
      )}: ${bold(s.artist.name)} - ${italic(s.track.name)}`;
    };
  }
}
