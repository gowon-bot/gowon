import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { PaceCalculator } from "../../../lib/calculators/PaceCalculator";
import { LogicError } from "../../../errors/errors";
import { isBefore, isValid } from "date-fns";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayDate, displayNumber } from "../../../lib/views/displays";
import { ago } from "../../../helpers";
import { humanizeTimeRange, TimeRange } from "../../../lib/timeAndDate/helpers";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimeRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimeRangeArgument";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { bold } from "../../../helpers/discord";

const args = {
  milestone: new NumberArgument({
    description: "The milestone you want to hit (defaults to your next 25k)",
  }),
  timeRange: new TimeRangeArgument({
    default: () => TimeRange.fromDuration({ weeks: 1 }),
    useOverall: true,
    description: "The time range to calculate your scrobble rate over",
  }),
  ...standardMentions,
} as const;

export default class Pace extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah minseo";

  aliases = ["pc"];
  description = "Predicts when a user is gonna hit a scrobble milestone";
  subcategory = "library stats";
  usage = ["", "milestone", "time period milestone @user"];

  arguments = args;

  slashCommand = true;

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
    const timeRange = this.parsedArguments.timeRange,
      milestone = this.parsedArguments.milestone;

    const { requestable, perspective } = await this.getMentions();

    const paceCalculator = new PaceCalculator(this.ctx, requestable);

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
        } will hit **${displayNumber(pace.milestone, "**scrobble")} on ${bold(
          displayDate(pace.prediction)
        )} (${ago(pace.prediction)})`
      );

    await this.send(embed);
  }
}
