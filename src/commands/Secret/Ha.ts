import { BaseCommand } from "../../lib/command/BaseCommand";
import { Message } from "discord.js";

export default class Ha extends BaseCommand {
  aliases = ["hah"];
  description = "Hah!";
  secretCommand = true;

  async run(message: Message) {
    await message.channel.send(
      "Hah! https://www.youtube.com/watch?v=3ec6jOMDCXI"
    );
  }
}
