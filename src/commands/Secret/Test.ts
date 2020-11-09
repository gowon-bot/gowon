import { sleep } from "../../helpers";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Test extends BaseCommand {
  description = "Testing testing 123";
  secretCommand = true;

  async testFunction(number: number): Promise<number> {
    await sleep(number);
    return number;
  }

  async run() {
    await this.send("Hello, world!");
  }
}
