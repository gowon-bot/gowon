import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Issues extends BaseCommand {
  secretCommand = true;
  description = "Displays the github issues link for the bot";

  async run() {
    await this.send("https://github.com/jivison/gowon/issues");
  }
}
