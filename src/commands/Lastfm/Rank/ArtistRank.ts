import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { RedirectsCache } from "../../../lib/caches/RedirectsCache";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { displayNumber } from "../../../lib/views/displays";
import { LogicError } from "../../../errors";
import { toInt } from "../../../helpers/lastFM";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  ...prefabArguments.artist,
} as const;

export default class ArtistRank extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature ye ah";

  aliases = ["ar", "ra"];
  description = "Shows what rank an artist is in your top 1000 artists";
  subcategory = "ranks";
  usage = ["artist @user"];

  arguments = args;

  redirectsService = ServiceRegistry.get(RedirectsService);
  redirectsCache = new RedirectsCache(this.redirectsService);

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      true
    );

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    await this.redirectsCache.initialCache(
      this.ctx,
      topArtists.artists.map((a) => a.name)
    );

    const rank = (
      await Promise.all(
        topArtists.artists.map(
          async (a) => await this.redirectsCache.getRedirect(a.name)
        )
      )
    ).findIndex((a) => a.toLowerCase() === artistName.toLowerCase());

    if (rank === -1) {
      const isNumber = !isNaN(toInt(this.parsedArguments.artist));

      throw new LogicError(
        `That artist wasn't found in ${
          perspective.possessive
        } top ${displayNumber(topArtists.artists.length, "artist")}`,
        isNumber
          ? `Looking to find the artist at rank ${this.parsedArguments.artist}? Run ${this.prefix}aa ${this.parsedArguments.artist}`
          : ""
      );
    } else {
      await this.traditionalReply(
        `${topArtists.artists[rank].name.strong()} is ranked #${displayNumber(
          rank + 1
        ).strong()} in ${
          perspective.possessive
        } top 1,000 artists with ${displayNumber(
          topArtists.artists[rank].userPlaycount
        ).strong()} plays`
      );
    }
  }
}
