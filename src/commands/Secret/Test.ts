import { BaseCommand } from "../../lib/command/BaseCommand";

const args = {} as const;

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123...4???";
  subcategory = "developer";

  secretCommand = true;
  arguments = args;
  slashCommand = true;

  async run() {
    await this.send("Hello, world!");
  }
}
