import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  ...prefabArguments.album,
} as const;

export default class AlbumPercent extends LastFMBaseCommand<typeof args> {
  idSeed = "twice chaeyoung";

  aliases = ["lpct", "alpct"];
  description =
    "Shows you what percentage of an artist's scrobbles are made up by a certain album";
  subcategory = "percents";
  usage = ["", "artist | album"];

  arguments = args;

  async run() {
    let { requestable, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable
    );

    const [artistInfo, albumInfo] = await Promise.all([
      this.lastFMService.artistInfo(this.ctx, {
        artist,
        username: requestable,
      }),
      this.lastFMService.albumInfo(this.ctx, {
        artist,
        album,
        username: requestable,
      }),
    ]);

    await this.traditionalReply(
      `${perspective.possessive} ${displayNumber(
        albumInfo.userPlaycount,
        "play"
      )} of ${albumInfo.name.strong()} represent ${calculatePercent(
        albumInfo.userPlaycount,
        artistInfo.userPlaycount
      ).strong()}% of ${
        perspective.possessivePronoun
      } ${artistInfo.name.strong()} scrobbles`
    );
  }
}
