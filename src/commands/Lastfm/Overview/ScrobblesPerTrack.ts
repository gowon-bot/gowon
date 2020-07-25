import { OverviewChildCommand } from "./OverviewChildCommand";
import { Message, MessageEmbed } from "discord.js";

export class ScrobblesPerTrack extends OverviewChildCommand {
  aliases = ["spt"];
  description = "Shows your average scrobbles per track";

  async run(message: Message) {
    let { username } = await this.parseMentionedUsername(message);

    let { badge, colour, image } = await this.getAuthorDetails();
    let spt = await this.calculator.avgScrobblesPerTrack();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`${spt.bold()} scrobbles per track!`);

    await message.channel.send(embed);
  }
}
