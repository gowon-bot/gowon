import { OverviewChildCommand } from "./OverviewChildCommand";
import { Message, MessageEmbed } from "discord.js";

export class Joined extends OverviewChildCommand {
  aliases = ["j", "join"];
  description = "Shows when a user joined";

  async run(message: Message) {
    let { username } = await this.parseMentionedUsername(message);

    let { badge, colour, image } = await this.getAuthorDetails();
    let joined = await this.calculator.joined();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`Scrobbling since ${joined}`);

    await message.channel.send(embed);
  }
}
