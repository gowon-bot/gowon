import { bold } from "../../../helpers/discord";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers/humanize";
import { displayNumber } from "../../../lib/views/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  timePeriod: new TimePeriodArgument({
    default: "overall",
    description: "The time period to count your albums over",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class ArtistCount extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah nana";

  aliases = ["ac"];
  description = "Shows you how many artists you've scrobbled";
  subcategory = "library stats";
  usage = ["", "time period @user"];

  slashCommand = true;

  arguments = args;

  async run() {
    const timePeriod = this.parsedArguments.timePeriod;
    const humanizedPeriod = humanizePeriod(timePeriod);

    const { requestable, perspective } = await this.getMentions();

    const artistCount = await this.lastFMService.artistCount(
      this.ctx,
      requestable,
      timePeriod
    );

    await this.oldReply(
      `${perspective.plusToHave} scrobbled ${bold(
        displayNumber(artistCount, "artist")
      )} ${humanizedPeriod}`
    );
  }
}
