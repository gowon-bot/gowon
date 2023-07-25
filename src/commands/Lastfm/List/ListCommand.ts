import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { DateRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/DateRangeArgument";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { DateRange } from "../../../lib/timeAndDate/DateRange";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers/humanize";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  timePeriod: new TimePeriodArgument({
    default: "7day",
    description: "The time period to use",
  }),
  dateRange: new DateRangeArgument({ description: "The time range to use" }),
  listAmount: new NumberArgument({
    default: 10,
    description: "The number of entries to show",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export abstract class ListCommand extends LastFMBaseCommand<typeof args> {
  idSeed = "stayc j";

  subcategory = "lists";
  usage = ["", "time period list_amount @user"];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    listAmount: {
      validator: new validators.RangeValidator({ min: 1, max: 25 }),
      friendlyName: "amount",
    },
  };

  dateRange?: DateRange;
  timePeriod!: LastFMPeriod;
  humanizedPeriod!: string;
  listAmount!: number;

  async beforeRun(): Promise<void> {
    this.dateRange = this.parsedArguments.dateRange;
    this.timePeriod = this.parsedArguments.timePeriod;
    this.listAmount = this.parsedArguments.listAmount;
    this.humanizedPeriod = humanizePeriod(this.timePeriod);
  }
}
