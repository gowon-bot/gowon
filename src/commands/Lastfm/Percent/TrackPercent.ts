import { Arguments } from "../../../lib/arguments/arguments";
import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class TrackPercent extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy yeji";

  aliases = ["tpct"];
  description =
    "Shows you what percentage of an artist's scrobbles are made up by a certain track";
  subcategory = "percents";
  usage = ["artist | track"];

  arguments: Arguments = args;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
      });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable
    );

    const [artistInfo, trackInfo] = await Promise.all([
      this.lastFMService.artistInfo(this.ctx, {
        artist,
        username: requestable,
      }),
      this.lastFMService.trackInfo(this.ctx, {
        artist,
        track,
        username: requestable,
      }),
    ]);

    await this.traditionalReply(
      `${perspective.possessive} ${displayNumber(
        trackInfo.userPlaycount,
        "play"
      )} of ${trackInfo.name.strong()} represent ${calculatePercent(
        trackInfo.userPlaycount,
        artistInfo.userPlaycount
      ).strong()}% of ${
        perspective.possessivePronoun
      } ${artistInfo.name.strong()} scrobbles`
    );
  }
}
