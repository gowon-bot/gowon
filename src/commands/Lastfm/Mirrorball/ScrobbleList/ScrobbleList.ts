import { MirrorballError } from "../../../../errors/errors";
import { toInt } from "../../../../helpers/lastFM";
import { convertMirrorballDate } from "../../../../helpers/mirrorball";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import { PaginatedCache } from "../../../../lib/paginators/PaginatedCache";
import {
  displayDateTime,
  displayNumberedList,
} from "../../../../lib/views/displays";
import { ScrollingEmbed } from "../../../../lib/views/embeds/ScrollingEmbed";
import {
  MirrorballDate,
  MirrorballPageInfo,
} from "../../../../services/mirrorball/MirrorballTypes";
import {
  ScrobbleListConnector,
  ScrobbleListParams,
  ScrobbleListResponse,
} from "./ScrobbleList.connector";

const args = {
  ...standardMentions,
  ...prefabArguments.track,
} as const;

export default class ScrobbleList extends MirrorballBaseCommand<
  ScrobbleListResponse,
  ScrobbleListParams,
  typeof args
> {
  connector = new ScrobbleListConnector();

  idSeed = "pink fantasy heesu";

  aliases = ["sli"];

  subcategory = "library";
  description = "Shows all the times you scrobbled a track";

  arguments = args;

  pageSize = 15;

  async run() {
    const { senderRequestable, dbUser, perspective } = await this.getMentions({
      senderRequired:
        !this.parsedArguments.artist || !this.parsedArguments.track,
      reverseLookup: { required: true },
      requireIndexed: true,
    });

    const { artist: artistName, track: trackName } =
      await this.lastFMArguments.getTrack(this.ctx, senderRequestable, true);

    const params = {
      track: { name: trackName, artist: { name: artistName } },
      user: { discordID: dbUser.discordID },
    };

    const paginatedCache = new PaginatedCache(async (page) => {
      const response = await this.query({
        ...params,
        pageInput: { limit: this.pageSize, offset: (page - 1) * this.pageSize },
      });

      return response.plays.plays;
    });

    const firstPages = await this.query({
      ...params,
      pageInput: { limit: this.pageSize * 3, offset: 0 },
    });

    paginatedCache.cacheInitial(firstPages.plays.plays, this.pageSize);

    const errors = this.parseErrors(firstPages);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Scrobble list"))
      .setTitle(
        `${
          perspective.upper.possessive
        } scrobbles of ${trackName.italic()} by ${artistName.strong()}`
      );

    const scrollingEmbed = new ScrollingEmbed(this.ctx, embed, {
      initialItems: this.generateTable(
        await paginatedCache.getPage(1),
        firstPages.plays.pageInfo,
        1
      ),
      totalPages: Math.ceil(
        firstPages.plays.pageInfo.recordCount / this.pageSize
      ),
      totalItems: firstPages.plays.pageInfo.recordCount,
      itemName: "scrobble",
    });

    scrollingEmbed.onPageChange(async (page) =>
      this.generateTable(
        await paginatedCache.getPage(page),
        firstPages.plays.pageInfo,
        page
      )
    );

    scrollingEmbed.send();
  }

  private generateTable(
    plays: { scrobbledAt: MirrorballDate }[],
    pageInfo: MirrorballPageInfo,
    page: number
  ): string {
    return displayNumberedList(
      plays.map((p) =>
        displayDateTime(convertMirrorballDate(toInt(p.scrobbledAt)))
      ),
      pageInfo.recordCount - (page - 1) * this.pageSize,
      -1
    );
  }
}
