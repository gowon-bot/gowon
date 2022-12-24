import { bold, italic } from "../../../../helpers/discord";
import { convertLilacDate } from "../../../../helpers/lilac";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Emoji } from "../../../../lib/Emoji";
import { LilacBaseCommand } from "../../../../lib/Lilac/LilacBaseCommand";
import { PaginatedLilacScrobbleCache } from "../../../../lib/paginators/PaginatedScrobbleCache";
import { displayDateTime } from "../../../../lib/views/displays";
import { LilacScrobbleFilters } from "../../../../services/lilac/LilacAPIService.types";
import { LilacLibraryService } from "../../../../services/lilac/LilacLibraryService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";

const args = {
  ...standardMentions,
  ...prefabArguments.track,
} satisfies ArgumentsMap;

export default class ScrobbleList extends LilacBaseCommand<typeof args> {
  idSeed = "pink fantasy heesu";
  aliases = ["sli"];

  subcategory = "library";
  description = "Lists all your scrobbles of a given track";

  arguments = args;

  slashCommand = true;
  pageSize = 15;

  lilacLibraryService = ServiceRegistry.get(LilacLibraryService);

  async run() {
    const { senderRequestable, dbUser, perspective } = await this.getMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.track,
      reverseLookup: { required: true },
      requireIndexed: true,
    });

    const { artist: artistName, track: trackName } =
      await this.lastFMArguments.getTrack(this.ctx, senderRequestable, {
        redirect: true,
      });

    const params: LilacScrobbleFilters = {
      user: { discordID: dbUser.discordID },
      track: { name: trackName, artist: { name: artistName } },
    };

    const scrobbleCache = new PaginatedLilacScrobbleCache(this.ctx, params);

    const firstPage = await scrobbleCache.getFirstPage();

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Scrobble list"))
      .setTitle(
        `${Emoji.usesIndexedDataTitle} ${
          perspective.upper.possessive
        } scrobbles of ${italic(trackName)} by ${bold(artistName)}`
      );

    if (firstPage.pagination.totalItems === 0) {
      await this.send(
        embed.setDescription(`You have no scrobbles of this song!`)
      );
      return;
    }

    const scrollingEmbed = await scrobbleCache.generateScrollingEmbed(
      embed,
      firstPage,
      (s) => displayDateTime(convertLilacDate(s.scrobbledAt))
    );

    scrollingEmbed.send();
  }
}
