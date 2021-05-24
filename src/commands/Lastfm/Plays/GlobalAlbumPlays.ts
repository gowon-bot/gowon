import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { calculatePercent } from "../../../helpers/stats";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class GlobalAlbumPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy chaeryeong";

  aliases = ["glp", "globallp"];
  description =
    "Shows you how many plays Last.fm has of a given album for all users";
  subcategory = "plays";
  usage = ["", "artist | album"];

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist,
      album = this.parsedArguments.album;

    let { senderUsername, username, perspective } = await this.parseMentions({
      senderRequired: !artist || !album,
    });

    if (!artist || !album) {
      let nowPlaying = await this.lastFMService.nowPlaying(senderUsername);

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    }

    let albumDetails = await this.lastFMService.albumInfo({
      artist,
      album,
      username,
    });

    let percentage = calculatePercent(
      albumDetails.userPlaycount,
      albumDetails.globalPlaycount
    );

    await this.send(
      `Last.fm has scrobbled ${albumDetails.name.italic()} by ${
        albumDetails.artist
      } ${displayNumber(albumDetails.globalPlaycount, "time")}${
        toInt(albumDetails.userPlaycount) > 0
          ? `. ${perspective.upper.plusToHave} ${displayNumber(
              albumDetails.userPlaycount,
              "scrobble"
            )} ${parseFloat(percentage) > 0 ? `(${percentage}%)` : ""}`
          : ""
      }`
    );
  }
}
