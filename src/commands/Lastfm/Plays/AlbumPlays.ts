import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class AlbumPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy lia";

  aliases = ["alp", "lp"];
  description = "Shows you how many plays you have of a given album";
  subcategory = "plays";
  usage = ["", "artist | album @user"];

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist!,
      album = this.parsedArguments.album!;

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

    await this.traditionalReply(
      `${perspective.plusToHave}` +
        (toInt(albumDetails.userPlaycount) === 0
          ? "n't scrobbled"
          : ` **${displayNumber(
              albumDetails.userPlaycount,
              "**scrobble"
            )} of`) +
        ` ${albumDetails.name.italic()} by ${albumDetails.artist.strong()}`
    );
  }
}
