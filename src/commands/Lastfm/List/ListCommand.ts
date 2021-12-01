import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { TimePeriodParser } from "../../../lib/arguments/custom/TimePeriodParser";
import { humanizePeriod } from "../../../helpers/date";

const args = {
  inputs: {
    timePeriod: { custom: new TimePeriodParser({ fallback: "7day" }) },
    listAmount: {
      index: 0,
      regex: /[0-9]{1,4}(?!\w)(?! [mw])/g,
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

  timePeriod!: LastFMPeriod;
  humanizedPeriod!: string;
  listAmount!: number;

  async prerun(): Promise<void> {
    this.timePeriod = this.parsedArguments.timePeriod!;
    this.listAmount = this.parsedArguments.listAmount!;
    this.humanizedPeriod = humanizePeriod(this.timePeriod);
  }
}
