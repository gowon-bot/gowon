import { LogicError } from "../../../errors";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ListCommand } from "./ListCommand";

const args = {
  type: new StringArgument({ index: 0 }),
  period: new StringArgument({ index: 1 }),
  amount: new StringArgument({ index: 2 }),
} as const;

export default class List extends ListCommand {
  idSeed = "stayc sieun";

  aliases = ["l"];
  description = "This is a temporary command <3";
  secretCommand = true;

  // Overwrite the ListCommand default arguments
  slashCommand = false;
  arguments = args as any;

  async run() {
    const type = (this.parsedArguments as any).type as string,
      period = (this.parsedArguments as any).period as string,
      amount = (this.parsedArguments as any).amount as string;

    if (!type || !period || !amount)
      throw new LogicError(
        "`list` has been split into three separate commands, `artistlist`, `albumlist`, and `tracklist`. The new syntax is similar to the old one. For example `!artistlist w 3` would show your top 3 artists over the last week."
      );

    let commandstring = this.prefix;

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
