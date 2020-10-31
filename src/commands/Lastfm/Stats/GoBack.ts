import { Arguments } from "../../../lib/arguments/arguments";
import {
  TimeRange,
  timeRangeParser,
  humanizedTimeRangeParser,
  parseDate,
} from "../../../helpers/date";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { TrackEmbed } from "../../../helpers/Embeds";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { dateDisplay } from "../../../helpers";

export default class GoBack extends LastFMBaseCommand {
  aliases = ["gb"];
  description = "Shows what you scrobbled in the past";
  subcategory = "library stats";
  usage = ["time period @user"];

  arguments: Arguments = {
    inputs: {
      timeRange: { custom: timeRangeParser(), index: -1 },
      humanizedTimeRange: {
        custom: humanizedTimeRangeParser({
          raw: true,
          noOverall: true,
          cleanSingleDurations: false,
        }),
        index: -1,
      },
      date: {
        custom: (string: string) =>
          parseDate(string.trim(), ...this.gowonService.constants.dateParsers),
        index: -1,
      },
    },
    mentions: standardMentions,
  };

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
    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanTimeRange = this.parsedArguments.humanizedTimeRange as string,
      date = this.parsedArguments.date as Date | undefined;

    if (!date && !timeRange.from)
      throw new LogicError("please enter a valid date or timezone!");

    let { username, perspective } = await this.parseMentions({
      asCode: false,
    });

    let track = await this.lastFMService.goBack(
      username,
      date || timeRange.from!
    );

    if (!track)
      throw new LogicError(
        `${perspective.plusToHave} not scrobbled any tracks in that time period!`
      );

    let embed = TrackEmbed(track).setAuthor(
      date
        ? `On ${dateDisplay(date)} ${perspective.name} scrobbled:`
        : `${humanTimeRange} ago ${perspective.name} scrobbled:`
    );

    await this.send(embed);
  }
}
