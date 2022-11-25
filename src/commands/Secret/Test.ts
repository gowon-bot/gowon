import { Command } from "../../lib/command/Command";
import { ArgumentsMap } from "../../lib/context/arguments/types";

const args = {} satisfies ArgumentsMap;

export default class Test extends Command<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123...4???";
  subcategory = "developer";

  secretCommand = true;
  arguments = args;
  slashCommand = true;
  twitterCommand = true;

  async run() {
    await this.send("Hello, world!");
  }
}
