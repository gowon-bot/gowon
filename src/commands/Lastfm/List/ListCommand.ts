import { Arguments } from "../../../lib/arguments/arguments";
import { generatePeriod, generateHumanPeriod } from "../../../helpers/date";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    timePeriod: {
      custom: (messageString: string) => generatePeriod(messageString, "7day"),
      index: -1,
    },
    humanReadableTimePeriod: {
      custom: (messageString: string) =>
        generateHumanPeriod(messageString, "7day"),
      index: -1,
    },
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
  humanReadableTimePeriod!: string;
  listAmount!: number;

  async prerun(): Promise<void> {
    this.timePeriod = this.parsedArguments.timePeriod!;
    this.humanReadableTimePeriod =
      this.parsedArguments.humanReadableTimePeriod!;
    this.listAmount = this.parsedArguments.listAmount!;
  }
}
