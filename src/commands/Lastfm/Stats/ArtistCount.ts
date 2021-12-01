import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";
import { TimePeriodParser } from "../../../lib/arguments/custom/TimePeriodParser";
import { humanizePeriod } from "../../../helpers/date";

const args = {
  inputs: {
    timePeriod: { custom: new TimePeriodParser() },
  },
  mentions: standardMentions,
} as const;

export default class ArtistCount extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah nana";

  aliases = ["ac"];
  description = "Shows you how many artists you've scrobbled";
  subcategory = "library stats";
  usage = ["", "time period @user"];

  arguments: Arguments = args;

  async run() {
    const timePeriod = this.parsedArguments.timePeriod!;
    const humanizedPeriod = humanizePeriod(timePeriod);

    const { requestable, perspective } = await this.parseMentions();

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
