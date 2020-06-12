import { BaseCommand } from "../BaseCommand";
import { Message, MessageEmbed } from "discord.js";
import { generateLink } from "../helpers/discord";

export class ProfilePic extends BaseCommand {
  aliases = ["hah", "ha"];
  description = "Hah!";
  secretCommand = true;

  async run(message: Message) {
    await message.channel.send("Hah! https://www.youtube.com/watch?v=3ec6jOMDCXI")
  }
}
