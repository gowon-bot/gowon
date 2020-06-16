import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";

export default class Pleading extends BaseCommand {
  aliases = ["🥺"];
  description = ":pleading:";
  secretCommand = true;

  async run(message: Message) {
    await message.channel.send(`​  🥺\n👉👈`);
  }
}
