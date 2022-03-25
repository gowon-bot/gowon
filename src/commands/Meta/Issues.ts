import { Command } from "../../lib/command/Command";

export default class Issues extends Command {
  idSeed = "apink eunji";

  secretCommand = true;
  description = "Displays the github issues link for the bot";
  subcategory = "developer";

  async run() {
    await this.send("https://github.com/jivison/gowon/issues");
  }
}
