import { Arguments } from "../../../lib/arguments/arguments";
import { generatePeriod, generateHumanPeriod } from "../../../helpers/date";
import { Message } from "discord.js";
import { BadAmountError } from "../../../errors";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";

export abstract class ListCommand extends LastFMBaseCommand {
  subcategory = "lists";
  usage = ["", "list_amount time period @user"];

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
      listAmount: {
        index: 0,
        regex: /[0-9]{1,4}(?!\w)(?! [mw])/g,
        default: 10,
        number: true,
      },
    },
  };

  timePeriod!: LastFMPeriod;
  humanReadableTimePeriod!: string;
  listAmount!: number;

  async prerun(_: Message): Promise<void> {
    this.timePeriod = this.parsedArguments.timePeriod as LastFMPeriod;
    this.humanReadableTimePeriod = this.parsedArguments
      .humanReadableTimePeriod as string;
    this.listAmount = this.parsedArguments.listAmount as number;

    if (this.listAmount < 1 || this.listAmount > 25)
      throw new BadAmountError(1, 25);
  }
}
