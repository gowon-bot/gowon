import { BaseCommand } from "../../lib/command/BaseCommand";
import { Message } from "discord.js";

export default class Github extends BaseCommand {
  aliases = ["gh"];
  secretCommand = true;
  description = "Displays the github link for the bot";

  async run(message: Message) {
    await message.channel.send("https://github.com/jivison/bot_moment");
  }
}
