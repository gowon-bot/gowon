import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { RedirectsCache } from "../../../lib/caches/RedirectsCache";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";

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
    let artist = this.parsedArguments.artist;

    let { username, senderUsername, perspective } = await this.parseMentions({
      senderRequired: !artist,
    });

    if (!artist)
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;

    let topArtists = await this.lastFMService.topArtists({
      username,
      limit: 1000,
    });

    const artistName = await this.redirectsCache.getRedirect(artist);

    let rank = (
      await Promise.all(
        topArtists.artist.map(
          async (a) => await this.redirectsCache.getRedirect(a.name)
        )
      )
    ).findIndex((a) => a.toLowerCase() === artistName.toLowerCase());

    if (rank === -1) {
      await this.traditionalReply(
        `that artist wasn't found in ${
          perspective.possessive
        } top ${numberDisplay(topArtists.artist.length, "artist")}`
      );
    } else {
      await this.traditionalReply(
        `${topArtists.artist[rank].name.strong()} is ranked #${numberDisplay(
          rank + 1
        ).strong()} in ${
          perspective.possessive
        } top 1,000 artists with ${numberDisplay(
          topArtists.artist[rank].playcount
        ).strong()} plays`
      );
    }
  }
}
