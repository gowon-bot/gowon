import { BaseCommand } from "../../lib/command/BaseCommand";
import { Message } from "discord.js";

export default class Ooga extends BaseCommand {
  description = "ooga";
  secretCommand = true;

  async run(message: Message) {
    await message.channel.send("booga");
  }
}
