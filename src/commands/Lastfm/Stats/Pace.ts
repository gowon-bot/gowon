import { isBefore, isValid } from "date-fns";
import { LogicError } from "../../../errors/errors";
import { ago } from "../../../helpers";
import { bold } from "../../../helpers/discord";
import { PaceCalculator } from "../../../lib/calculators/PaceCalculator";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { DateRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/DateRangeArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { DateRange } from "../../../lib/timeAndDate/DateRange";
import { humanizeDateRange } from "../../../lib/timeAndDate/helpers/humanize";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayDate, displayNumber } from "../../../lib/views/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  milestone: new NumberArgument({
    description: "The milestone you want to hit (defaults to your next 25k)",
  }),
  dateRange: new DateRangeArgument({
    default: () => DateRange.fromDuration({ weeks: 1 }),
    useOverall: true,
    description: "The time range to calculate your scrobble rate over",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

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
      new validators.RangeValidator({ min: 1 }),
      new validators.RangeValidator({
        max: 10000000,
        message: "you probably won't be alive to witness that milestone...",
      }),
    ],
  };

  async run() {
    const dateRange = this.parsedArguments.dateRange,
      milestone = this.parsedArguments.milestone;

    const { requestable, perspective } = await this.getMentions();

    const paceCalculator = new PaceCalculator(this.ctx, requestable);

    const pace = await paceCalculator.calculate(dateRange, milestone);

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

    const humanizedDateRange = humanizeDateRange(dateRange, {
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
        )}/hour** ${humanizedDateRange}, ${
          perspective.name
        } will hit **${displayNumber(pace.milestone, "**scrobble")} on ${bold(
          displayDate(pace.prediction)
        )} (${ago(pace.prediction)})`
      );

    await this.send(embed);
  }
}
