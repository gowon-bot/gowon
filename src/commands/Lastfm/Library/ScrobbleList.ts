import { bold, italic } from "../../../helpers/discord";
import { convertLilacDate } from "../../../helpers/lilac";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { Emoji } from "../../../lib/Emoji";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { PaginatedCache } from "../../../lib/paginators/PaginatedCache";
import {
  displayDateTime,
  displayNumberedList,
} from "../../../lib/views/displays";
import { ScrollingEmbed } from "../../../lib/views/embeds/ScrollingEmbed";
import {
  LilacDate,
  LilacPagination,
} from "../../../services/lilac/LilacAPIService.types";
import { LilacLibraryService } from "../../../services/lilac/LilacLibraryService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

const args = {
  ...standardMentions,
  ...prefabArguments.track,
} as const;

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

    const params = {
      user: { discordID: dbUser.discordID },
      track: { name: trackName, artist: { name: artistName } },
    };

    const paginatedCache = new PaginatedCache(async (page) => {
      const response = await this.lilacLibraryService.scrobbleList(this.ctx, {
        ...params,
        pagination: { page, perPage: this.pageSize },
      });

      return response.scrobbles;
    });

    const firstPage = await this.lilacLibraryService.scrobbleList(this.ctx, {
      ...params,
      pagination: { page: 1, perPage: this.pageSize },
    });

    paginatedCache.cacheInitial(firstPage.scrobbles, this.pageSize);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Scrobble list"))
      .setTitle(
        `${Emoji.usesIndexedData} ${
          perspective.upper.possessive
        } scrobbles of ${italic(trackName)} by ${bold(artistName)}`
      );

    if (firstPage.pagination.totalItems === 0) {
      await this.send(
        embed.setDescription(`You have no scrobbles of this song!`)
      );
      return;
    }

    const scrollingEmbed = new ScrollingEmbed(this.ctx, embed, {
      initialItems: this.generateTable(
        await paginatedCache.getPage(1),
        firstPage.pagination,
        1
      ),
      totalPages: Math.ceil(firstPage.pagination.totalPages),
      totalItems: firstPage.pagination.totalItems,
      itemName: "scrobble",
    });

    scrollingEmbed.onPageChange(async (page) =>
      this.generateTable(
        await paginatedCache.getPage(page),
        firstPage.pagination,
        page
      )
    );

    scrollingEmbed.send();
  }

  private generateTable(
    plays: { scrobbledAt: LilacDate }[],
    pageInfo: LilacPagination,
    page: number
  ): string {
    return displayNumberedList(
      plays.map((p) => displayDateTime(convertLilacDate(p.scrobbledAt))),
      pageInfo.perPage * (page - 1)
    );
  }
}
