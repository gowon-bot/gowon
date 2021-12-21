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
    const { senderRequestable, requestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable
    );

    let albumDetails = await this.lastFMService.albumInfo(this.ctx, {
      artist,
      album,
      username: requestable,
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
