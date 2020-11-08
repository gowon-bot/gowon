import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { calculatePercent } from "../../../helpers/stats";

export default class GlobalAlbumPlays extends LastFMBaseCommand {
  aliases = ["glp", "globallp"];
  description = "Shows you how many plays Last.fm has of a given album for all users";
  subcategory = "plays";
  usage = ["", "artist | album"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
    },
    mentions: standardMentions,
  };

  async run() {
    let artist = this.parsedArguments.artist as string,
      album = this.parsedArguments.album as string;

    let { senderUsername, username, perspective } = await this.parseMentions({
      senderRequired: !artist || !album,
    });

    if (!artist || !album) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    }

    let albumDetails = await this.lastFMService.albumInfo({
      artist,
      album,
      username,
    });

    let percentage = calculatePercent(
      albumDetails.userplaycount,
      albumDetails.playcount
    );

    this.send(
      `Last.fm has scrobbled ${albumDetails.name.italic()} by ${
        albumDetails.artist
      } ${numberDisplay(albumDetails.playcount, "time")}${
        albumDetails.userplaycount.toInt() > 0
          ? `. ${perspective.upper.plusToHave} ${numberDisplay(
              albumDetails.userplaycount,
              "scrobble"
            )} ${parseFloat(percentage) > 0 ? `(${percentage}%)` : ""}`
          : ""
      }`
    );
  }
}
