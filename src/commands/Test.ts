import { Message } from "discord.js";
import { BaseCommand } from "../lib/command/BaseCommand";

export default class Test extends BaseCommand {
  description = "Testing testing 123";
  secretCommand = true;

  async run(message: Message) {
    await message.channel.send("Hello, world!")
  }
}
