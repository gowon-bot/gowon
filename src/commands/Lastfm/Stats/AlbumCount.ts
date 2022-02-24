import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";

const args = {
  ...standardMentions,
  timePeriod: new TimePeriodArgument(),
} as const;

export default class AlbumCount extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature semi";
  aliases = ["alc", "lc"];
  description = "Shows you how many albums you've scrobbled";
  subcategory = "library stats";
  usage = ["", "time period @user"];

  arguments = args;

  async run() {
    const timePeriod = this.parsedArguments.timePeriod!;
    const humanizedPeriod = humanizePeriod(timePeriod);

    const { requestable, perspective } = await this.getMentions();

    const albumCount = await this.lastFMService.albumCount(
      this.ctx,
      requestable,
      timePeriod
    );

    await this.traditionalReply(
      `${perspective.plusToHave} scrobbled ${displayNumber(
        albumCount,
        "album"
      ).strong()} ${humanizedPeriod}`
    );
  }
}
