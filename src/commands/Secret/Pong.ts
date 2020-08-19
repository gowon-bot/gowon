import { BaseCommand } from "../../lib/command/BaseCommand";
import { Message } from "discord.js";

export default class Pong extends BaseCommand {
  description = "!gnoP !gniP";
  secretCommand = true;

  async run(message: Message) {
    await message.reply("🏓 gniP");
  }
}
