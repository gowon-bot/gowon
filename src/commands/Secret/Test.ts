import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Test extends BaseCommand {
  idSeed = "clc seunghee";

  description = "Testing testing 123";
  secretCommand = true;

  async run() {
    await this.send("Hello, world!");
  }
}
