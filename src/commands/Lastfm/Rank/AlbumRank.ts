import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";
import { LogicError } from "../../../errors";
import { toInt } from "../../../helpers/lastFM";

const args = {
  inputs: {
    artist: {
      index: 0,
      splitOn: "|",
    },
    album: {
      index: 1,
      splitOn: "|",
    },
  },
  mentions: standardMentions,
} as const;

export default class AlbumRank extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature chaesol";

  aliases = ["alra", "lra", "lr"];
  description = "Shows what rank a given album is in your top 1000 albums";
  subcategory = "ranks";
  usage = ["", "artist | album @user"];

  arguments: Arguments = args;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.album || !this.parsedArguments.artist,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable,
      true
    );

    const topAlbums = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    const rank = topAlbums.albums.findIndex(
      (a) =>
        a.name.toLowerCase() === album!.toLowerCase() &&
        a.artist.name.toLowerCase() === artist!.toLowerCase()
    );

    if (rank === -1) {
      const isNumber = !isNaN(toInt(this.parsedArguments.artist));

      throw new LogicError(
        `That album wasn't found in ${
          perspective.possessive
        } top ${displayNumber(topAlbums.albums.length, "album")}`,
        isNumber
          ? `Looking to find the album at rank ${this.parsedArguments.artist}? Run ${this.prefix}ala ${this.parsedArguments.artist}`
          : ""
      );
    } else {
      await this.traditionalReply(
        `${topAlbums.albums[rank].name.strong()} by ${
          topAlbums.albums[rank].artist.name
        } is ranked #${displayNumber(rank + 1).strong()} with ${displayNumber(
          topAlbums.albums[rank].userPlaycount,
          "play"
        ).strong()}`
      );
    }
  }
}
