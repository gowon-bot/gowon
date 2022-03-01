import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { trackEmbed } from "../../../lib/views/embeds";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayDate } from "../../../lib/views/displays";
import { ago } from "../../../helpers";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimeRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimeRangeArgument";
import { DateArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/DateArgument";

const args = {
  timeRange: new TimeRangeArgument({
    description: "The amount of time to go back",
  }),
  date: new DateArgument({
    description: "The date to go back to (yyyy/mm/dd)",
  }),
  ...standardMentions,
} as const;

export default class GoBack extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah sora";

  aliases = ["gb"];
  description = "Shows what you scrobbled in the past...";
  subcategory = "library stats";
  usage = ["time period @user"];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    timeRange: {
      validator: new validators.TimeRange({
        requireFrom: true,
        treatOnlyToAsEmpty: true,
      }),
      friendlyName: "time range",
    },
  };

  async run() {
    const timeRange = this.parsedArguments.timeRange,
      date = this.parsedArguments.date;

    if (!date && !timeRange?.from) {
      throw new LogicError("please enter a valid date or time range!");
    }

    const { requestable, perspective } = await this.getMentions({
      asCode: false,
    });

    const track = await this.lastFMService.goBack(
      this.ctx,
      requestable,
      (date || timeRange?.from)!
    );

    if (!track)
      throw new LogicError(
        `${perspective.plusToHave} not scrobbled any tracks in that time period!`
      );

    const embed = this.newEmbed(trackEmbed(track));

    embed.setDescription(
      embed.description +
        (date
          ? `\n\nScrobbled on ${displayDate(date)}`
          : `\n\nScrobbled ${ago(timeRange?.from!)}`)
    );

    await this.send(embed);
  }
}
