import { promiseAllSettled } from "../../helpers";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Test extends BaseCommand {
  description = "Testing testing 123";
  secretCommand = true;

  async run() {
    // await this.send("Hello, world!");

    const function1 = async () => "mystring";
    const function2 = async () => 4;

    let [one, two] = await promiseAllSettled([function1(), function2()]);

    one.value;
    two.value;
  }
}
