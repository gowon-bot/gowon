import { BaseCommand } from "../../lib/command/BaseCommand";

const args = {} as const;

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123";
  secretCommand = true;
  subcategory = "developer";

  async run() {
    await this.send("Hello, world!");
  }
}
