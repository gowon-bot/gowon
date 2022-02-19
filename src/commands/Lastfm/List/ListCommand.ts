import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { humanizePeriod, TimeRange } from "../../../lib/timeAndDate/helpers";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { TimeRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimeRangeArgument";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  ...standardMentions,
  timePeriod: new TimePeriodArgument({ fallback: "7day" }),
  timeRange: new TimeRangeArgument(),
  listAmount: new NumberArgument({ default: 10 }),
} as const;

export abstract class ListCommand extends LastFMBaseCommand<typeof args> {
  idSeed = "stayc j";

  subcategory = "lists";
  usage = ["", "list_amount time period @user"];

  arguments = args;

  validation: Validation = {
    listAmount: {
      validator: new validators.Range({ min: 1, max: 25 }),
      friendlyName: "amount",
    },
  };

  timeRange?: TimeRange;
  timePeriod!: LastFMPeriod;
  humanizedPeriod!: string;
  listAmount!: number;

  async prerun(): Promise<void> {
    this.timeRange = this.parsedArguments.timeRange;
    this.timePeriod = this.parsedArguments.timePeriod!;
    this.listAmount = this.parsedArguments.listAmount!;
    this.humanizedPeriod = humanizePeriod(this.timePeriod);
  }
}
