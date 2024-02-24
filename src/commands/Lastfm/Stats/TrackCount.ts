import { bold } from "../../../helpers/discord";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers/humanize";
import { displayNumber } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  timePeriod: new TimePeriodArgument({
    default: "overall",
    description: "The time period to count your albums over",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class TrackCount extends LastFMBaseCommand<typeof args> {
  idSeed = "secret number soodam";

  aliases = ["tc"];
  description = "Shows you how many tracks you've scrobbled";
  subcategory = "library stats";
  usage = ["", "time period @user"];

  slashCommand = true;

  arguments = args;

  async run() {
    const timePeriod = this.parsedArguments.timePeriod;

    const { requestable, perspective } = await this.getMentions();

    const trackCount = await this.lastFMService.trackCount(
      this.ctx,
      requestable,
      timePeriod
    );

    const embed = this.minimalEmbed().setDescription(
      `${perspective.upper.plusToHave} scrobbled ${bold(
        displayNumber(trackCount, "track")
      )} ${humanizePeriod(timePeriod)}`
    );

    await this.reply(embed);
  }
}
