import { Arguments } from "../../../lib/arguments/arguments";
import { generatePeriod, generateHumanPeriod } from "../../../helpers/date";
import { Message } from "discord.js";
import { BadAmountError } from "../../../errors";
import { LastFMBaseChildCommand } from "../LastFMBaseCommand";

export abstract class ListChildCommand extends LastFMBaseChildCommand {
  parentName = "list"

  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      timePeriod: {
        custom: (messageString: string) =>
          generatePeriod(messageString, "7day"),
        index: -1,
      },
      humanReadableTimePeriod: {
        custom: (messageString: string) =>
          generateHumanPeriod(messageString, "7day"),
        index: -1,
      },
      listAmount: { index: 0, regex: /[0-9]{1,4}(?!\w)(?! [a-z])/g },
    },
  };

  timePeriod!: string;
  humanReadableTimePeriod!: string;
  listAmount!: number;

  async prerun(_: Message): Promise<void> {
    this.timePeriod = this.parsedArguments.timePeriod as string;
    this.humanReadableTimePeriod = this.parsedArguments
      .humanReadableTimePeriod as string;
    this.listAmount =
      parseInt(this.parsedArguments.listAmount as string, 10) || 10;

    if (this.listAmount < 1 || this.listAmount > 25)
      throw new BadAmountError(1, 25);
  }
}
