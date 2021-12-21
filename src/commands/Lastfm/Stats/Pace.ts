import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { PaceCalculator } from "../../../lib/calculators/PaceCalculator";
import { LogicError } from "../../../errors";
import { isBefore, isValid } from "date-fns";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayDate, displayNumber } from "../../../lib/views/displays";
import { ago } from "../../../helpers";
import { TimeRangeParser } from "../../../lib/arguments/custom/TimeRangeParser";
import { humanizeTimeRange } from "../../../lib/timeAndDate/helpers";

const args = {
  inputs: {
    timeRange: {
      custom: new TimeRangeParser({ fallback: { weeks: 1 }, useOverall: true }),
    },
    milestone: {
      index: 0,
      regex: /[0-9]+(?![\w.])(?! [a-z])/g,
      number: true,
    },
  },
  mentions: standardMentions,
} as const;

export default class Pace extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah minseo";

  aliases = ["pc"];
  description = "Predicts when a user is gonna hit a scrobble milestone";
  subcategory = "library stats";
  usage = ["", "milestone", "time period milestone @user"];

  arguments: Arguments = args;

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
    const timeRange = this.parsedArguments.timeRange!,
      milestone = this.parsedArguments.milestone;

    const { requestable, perspective } = await this.getMentions();

    const paceCalculator = new PaceCalculator(this.lastFMService, requestable);

    const pace = await paceCalculator.calculate(timeRange, milestone);

    if (!isValid(pace.prediction)) {
      throw new LogicError(
        "An error occurred while calculating the pace. Try again with a more reasonable time frame..."
      );
    }

    if (isBefore(pace.prediction, new Date())) {
      throw new LogicError(
        `${perspective.plusToHave} already passed ${displayNumber(
          milestone!,
          "scrobble"
        )}!`
      );
    }

    const humanizedTimeRange = humanizeTimeRange(timeRange, {
      fallback: "week",
      useOverall: true,
      overallMessage: `since ${perspective.pronoun} began scrobbling`,
    });

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Pace"))
      .setDescription(
        `At a rate of **${displayNumber(
          pace.scrobbleRate.toFixed(2),
          "scrobble"
        )}/hour** ${humanizedTimeRange}, ${
          perspective.name
        } will hit **${displayNumber(
          pace.milestone,
          "**scrobble"
        )} on ${displayDate(pace.prediction).strong()} (${ago(
          pace.prediction
        )})`
      );

    await this.send(embed);
  }
}
