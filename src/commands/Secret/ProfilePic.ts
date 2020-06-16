import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";

export default class ProfilePic extends BaseCommand {
  aliases = ["hah", "ha"];
  description = "Hah!";
  secretCommand = true;

  async run(message: Message) {
    await message.channel.send(
      "Hah! https://www.youtube.com/watch?v=3ec6jOMDCXI"
    );
  }
}
