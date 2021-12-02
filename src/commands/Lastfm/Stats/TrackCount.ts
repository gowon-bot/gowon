import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";
import { TimePeriodParser } from "../../../lib/arguments/custom/TimePeriodParser";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers";

const args = {
  inputs: {
    timePeriod: { custom: new TimePeriodParser() },
  },
  mentions: standardMentions,
} as const;

export default class TrackCount extends LastFMBaseCommand<typeof args> {
  idSeed = "secret number soodam";

  aliases = ["tc"];
  description = "Shows you how many tracks you've scrobbled";
  subcategory = "library stats";
  usage = ["", "time period @user"];

  arguments: Arguments = args;

  async run() {
    const timePeriod = this.parsedArguments.timePeriod!;

    const { requestable, perspective } = await this.parseMentions();

    const trackCount = await this.lastFMService.trackCount(
      this.ctx,
      requestable,
      timePeriod
    );

    await this.traditionalReply(
      `${perspective.plusToHave} scrobbled ${displayNumber(
        trackCount,
        "track"
      ).strong()} ${humanizePeriod(timePeriod)}`
    );
  }
}
