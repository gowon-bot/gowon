import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { numberDisplay } from "../../../helpers";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

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
    let album = this.parsedArguments.album,
      artist = this.parsedArguments.artist;

    let { username, senderUsername, perspective } = await this.parseMentions({
      senderRequired: !artist || !album,
    });

    if (!album || !artist) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!album) album = nowPlaying.album;
      if (!artist) artist = nowPlaying.artist;
    }

    let topAlbums = await this.lastFMService.topAlbums({
      username,
      limit: 1000,
    });

    let rank = topAlbums.album.findIndex(
      (a) =>
        a.name.toLowerCase() === album!.toLowerCase() &&
        a.artist.name.toLowerCase() === artist!.toLowerCase()
    );

    if (rank === -1) {
      await this.traditionalReply(
        `that album wasn't found in ${
          perspective.possessive
        } top ${numberDisplay(topAlbums.album.length, "album")}`
      );
    } else {
      await this.traditionalReply(
        `${topAlbums.album[rank].name.strong()} by ${
          topAlbums.album[rank].artist.name
        } is ranked #${numberDisplay(rank + 1).strong()} with ${numberDisplay(
          topAlbums.album[rank].playcount,
          "play"
        ).strong()}`
      );
    }
  }
}
