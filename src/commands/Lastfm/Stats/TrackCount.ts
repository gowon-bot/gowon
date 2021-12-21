import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";

const args = {
  ...standardMentions,
  timePeriod: new TimePeriodArgument(),
} as const;

export default class TrackCount extends LastFMBaseCommand<typeof args> {
  idSeed = "secret number soodam";

  aliases = ["tc"];
  description = "Shows you how many tracks you've scrobbled";
  subcategory = "library stats";
  usage = ["", "time period @user"];

  arguments = args;

  async run() {
    const timePeriod = this.parsedArguments.timePeriod!;

    const { requestable, perspective } = await this.getMentions();

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
