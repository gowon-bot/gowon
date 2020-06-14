import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";

export default class Github extends BaseCommand {
  secretCommand = true;
  description = "Displays the github link for the bot";

  async run(message: Message) {
    await message.channel.send("https://github.com/jivison/bot_moment");
  }
}
