import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { ListCommand } from "./ListCommand";

const args = {
  inputs: {
    type: { index: 0 },
    period: { index: 1 },
    amount: { index: 2 },
  },
} as const;

export default class List extends ListCommand {
  idSeed = "stayc sieun";

  aliases = ["l"];
  description = "This is a temporary command <3";
  secretCommand = true;

  arguments: Arguments = args;

  async run() {
    let type = (this.parsedArguments as any).type as string,
      period = (this.parsedArguments as any).period as string,
      amount = (this.parsedArguments as any).amount as string;

    if (!type || !period || !amount)
      throw new LogicError(
        "`list` has been split into three separate commands, `artistlist`, `albumlist`, and `tracklist`. The new syntax is similar to the old one. For example `!artistlist w 3` would show your top 3 artists over the last week."
      );

    let commandstring = await this.gowonService.prefix(this.guild.id);

    if (type === "a") commandstring += "al ";
    if (type === "l") commandstring += "ll ";
    if (type === "t") commandstring += "tl ";

    commandstring += period + " ";

    commandstring += amount;

    await this.send(
      `The syntax for the list command has changed! The new syntax for your request is: ${commandstring.code()}`
    );
  }
}
