import { Arguments } from "../../lib/arguments/arguments";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { DurationParser } from "../../lib/DurationParser";
import { Logger } from "../../lib/Logger";

export default class Test extends BaseCommand {
  description = "Testing testing 123";
  secretCommand = true;

  arguments: Arguments = {
    inputs: {
      timePeriod: { index: { start: 0 } },
    },
  };

  async run() {
    let durationParser = new DurationParser();

    let duration = durationParser.parse(this.parsedArguments.timePeriod);

    await this.send("```\n" + Logger.formatObject(duration) + "\n```");
  }
}
