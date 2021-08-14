import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { RedirectsCache } from "../../../lib/caches/RedirectsCache";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { displayNumber } from "../../../lib/views/displays";
import { LogicError } from "../../../errors";

const args = {
  inputs: {
    artist: {
      index: { start: 0 },
    },
  },
  mentions: standardMentions,
} as const;

export default class ArtistRank extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature ye ah";

  aliases = ["ar", "ra"];
  description = "Shows what rank an artist is in your top 1000 artists";
  subcategory = "ranks";
  usage = ["artist @user"];

  arguments: Arguments = args;

  redirectsService = new RedirectsService(this.logger);
  redirectsCache = new RedirectsCache(this.redirectsService);

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.parseMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artistName = await this.lastFMArguments.getArtist(
      senderRequestable,
      true
    );

    const topArtists = await this.lastFMService.topArtists({
      username: requestable,
      limit: 1000,
    });

    const rank = (
      await Promise.all(
        topArtists.artists.map(
          async (a) => await this.redirectsCache.getRedirect(a.name)
        )
      )
    ).findIndex((a) => a.toLowerCase() === artistName.toLowerCase());

    if (rank === -1) {
      throw new LogicError(
        `That artist wasn't found in ${
          perspective.possessive
        } top ${displayNumber(topArtists.artists.length, "artist")}`
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
