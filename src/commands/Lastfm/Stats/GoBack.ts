import { Arguments } from "../../../lib/arguments/arguments";
import {
  TimeRange,
  timeRangeParser,
  humanizedTimeRangeParser,
} from "../../../helpers/date";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { TrackEmbed } from "../../../helpers/Embeds";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

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
    },
    mentions: standardMentions,
  };

  validation: Validation = {
    timeRange: {
      validator: new validators.TimeRange({ requireFrom: true }),
      friendlyName: "time range",
    },
  };

  async run() {
    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanTimeRange = this.parsedArguments.humanizedTimeRange as string;

    let { username, perspective } = await this.parseMentions({
      asCode: false,
    });

    let track = await this.lastFMService.goBack(username, timeRange.from!);

    if (!track)
      throw new LogicError(
        `${perspective.plusToHave} not scrobbled any tracks in that time period!`
      );

    let embed = TrackEmbed(track).setAuthor(
      `${humanTimeRange} ago ${perspective.name} scrobbled:`
    );

    await this.send(embed);
  }
}
