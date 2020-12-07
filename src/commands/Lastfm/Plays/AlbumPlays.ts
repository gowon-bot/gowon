import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class AlbumPlays extends LastFMBaseCommand {
  idSeed = "itzy lia";

  aliases = ["alp", "lp"];
  description = "Shows you how many plays you have of a given album";
  subcategory = "plays";
  usage = ["", "artist | album @user"];

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

    await this.reply(
      `${perspective.plusToHave}` +
        (albumDetails.userplaycount.toInt() === 0
          ? "n't scrobbled"
          : ` **${numberDisplay(
              albumDetails.userplaycount,
              "**scrobble"
            )} of`) +
        ` ${albumDetails.name.italic()} by ${albumDetails.artist.strong()}`
    );
  }
}
