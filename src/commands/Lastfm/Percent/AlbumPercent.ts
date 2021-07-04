import { Arguments } from "../../../lib/arguments/arguments";
import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class AlbumPercent extends LastFMBaseCommand<typeof args> {
  idSeed = "twice chaeyoung";

  aliases = ["lpct", "alpct"];
  description =
    "Shows you what percentage of an artist's scrobbles are made up by a certain album";
  subcategory = "percents";
  usage = ["", "artist | album"];

  arguments: Arguments = args;

  async run() {
    let { requestable, senderRequestable, perspective } =
      await this.parseMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      senderRequestable
    );

    const [artistInfo, albumInfo] = await Promise.all([
      this.lastFMService.artistInfo({ artist, username: requestable }),
      this.lastFMService.albumInfo({ artist, album, username: requestable }),
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
