import { Arguments } from "../../../lib/arguments/arguments";
import {
  TimeRange,
  timeRangeParser,
  humanizedTimeRangeParser,
} from "../../../helpers/date";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { PaceCalculator } from "../../../lib/calculators/PaceCalculator";
import { LogicError } from "../../../errors";
import { numberDisplay, dateDisplay } from "../../../helpers";
import { isBefore, isValid } from "date-fns";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class Pace extends LastFMBaseCommand {
  aliases = ["pc"];
  description = "Predicts when a user is gonna hit a scrobble milestone";
  subcategory = "library stats";
  usage = ["", "milestone", "time period milestone @user"];

  arguments: Arguments = {
    inputs: {
      timeRange: {
        custom: timeRangeParser({ default: { weeks: 1 }, useOverall: true }),
        index: -1,
      },
      humanizedTimeRange: {
        custom: humanizedTimeRangeParser({
          default: "week",
          overallMessage: "since <user> began scrobbling",
        }),
        index: -1,
      },
      milestone: {
        index: 0,
        regex: /[0-9]+(?!\w)(?! [a-z])/g,
        number: true,
      },
    },
    mentions: standardMentions,
  };

  validation: Validation = {
    milestone: [
      new validators.Range({ min: 1 }),
      new validators.Range({
        max: 10000000,
        message: "you probably won't be alive to witness that milestone...",
      }),
    ],
  };

  async run() {
    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanizedTimeRange = this.parsedArguments.humanizedTimeRange as string,
      milestone = this.parsedArguments.milestone as number | undefined;

    let { username, perspective } = await this.parseMentions();

    let paceCalculator = new PaceCalculator(this.lastFMService, username);

    let pace = await paceCalculator.calculate(timeRange, milestone);

    if (!isValid(pace.prediction))
      throw new LogicError(
        "An error occurred while calculating the pace. Try again with a more reasonable time frame..."
      );

    if (isBefore(pace.prediction, new Date()))
      throw new LogicError(
        `${perspective.plusToHave} already passed ${numberDisplay(
          milestone!,
          "scrobble"
        )}!`
      );

    let embed = this.newEmbed().setDescription(
      `At a rate of **${numberDisplay(
        pace.scrobbleRate.toFixed(2),
        "scrobble"
      )}/hour** ${humanizedTimeRange.replace("<user>", perspective.pronoun)}, ${
        perspective.name
      } will hit **${numberDisplay(
        pace.milestone,
        "**scrobble"
      )} on ${dateDisplay(pace.prediction).bold()}`
    );

    await this.send(embed);
  }
}
