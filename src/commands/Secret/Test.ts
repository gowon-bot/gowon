import { BaseCommand } from "../../lib/command/BaseCommand";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";

const args = {
  e: new StringArgument(),
} as const;

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123";
  secretCommand = true;
  subcategory = "developer";

  async run() {
    this.parsedArguments.e;

    await this.send("Hello, world!");
  }
}
