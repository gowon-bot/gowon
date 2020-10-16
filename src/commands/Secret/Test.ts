import { Arguments } from "../../lib/arguments/arguments";
import { standardMentions } from "../../lib/arguments/mentions/mentions";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { Logger } from "../../lib/Logger";

export default class Test extends BaseCommand {
  description = "Testing testing 123";
  secretCommand = true;

  arguments: Arguments = {
    mentions: standardMentions,
  };

  async run() {
    await this.send(
      "```\n" + Logger.formatObject(this.parsedArguments) + "\n```"
    );
  }
}
