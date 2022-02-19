import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { calculatePercent } from "../../../helpers/stats";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  ...prefabArguments.album,
} as const;

export default class GlobalAlbumPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy chaeryeong";

  aliases = ["glp", "globallp"];
  description =
    "Shows you how many plays Last.fm has of a given album for all users";
  subcategory = "plays";
  usage = ["", "artist | album"];

  arguments = args;

  async run() {
    const { senderRequestable, requestable, perspective } =
      await this.parseMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable
    );

    const albumDetails = await this.lastFMService.albumInfo(this.ctx, {
      artist,
      album,
      username: requestable,
    });

    const percentage = calculatePercent(
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
