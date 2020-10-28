import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Github extends BaseCommand {
  aliases = ["gh"];
  secretCommand = true;
  description = "Displays the github link for the bot";

  async run() {
    await this.send("https://github.com/jivison/gowon");
  }
}
