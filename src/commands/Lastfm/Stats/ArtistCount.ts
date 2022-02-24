import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";

const args = {
  ...standardMentions,
  timePeriod: new TimePeriodArgument(),
} as const;

export default class ArtistCount extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah nana";

  aliases = ["ac"];
  description = "Shows you how many artists you've scrobbled";
  subcategory = "library stats";
  usage = ["", "time period @user"];

  arguments = args;

  async run() {
    const timePeriod = this.parsedArguments.timePeriod!;
    const humanizedPeriod = humanizePeriod(timePeriod);

    const { requestable, perspective } = await this.getMentions();

    const artistCount = await this.lastFMService.artistCount(
      this.ctx,
      requestable,
      timePeriod
    );

    await this.traditionalReply(
      `${perspective.plusToHave} scrobbled ${displayNumber(
        artistCount,
        "artist"
      ).strong()} ${humanizedPeriod}`
    );
  }
}
