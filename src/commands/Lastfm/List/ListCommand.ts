import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { TimePeriodParser } from "../../../lib/arguments/custom/TimePeriodParser";
import { humanizePeriod, TimeRange } from "../../../lib/timeAndDate/helpers";
import { TimeRangeParser } from "../../../lib/arguments/custom/TimeRangeParser";

const args = {
  inputs: {
    timePeriod: { custom: new TimePeriodParser({ fallback: "7day" }) },
    timeRange: { custom: new TimeRangeParser() },
    listAmount: {
      index: 0,
      regex: /\b[0-9]{1,2}(?!\w)(?! [mw])/g,
      default: 10,
      number: true,
    },
  },
  mentions: standardMentions,
} as const;

export abstract class ListCommand extends LastFMBaseCommand<typeof args> {
  idSeed = "stayc j";

  subcategory = "lists";
  usage = ["", "list_amount time period @user"];

  arguments: Arguments = args;

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
