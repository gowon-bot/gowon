import { OverviewChildCommand } from "./OverviewChildCommand";
import { Message, MessageEmbed } from "discord.js";

export class ScrobblesPerAlbum extends OverviewChildCommand {
  aliases = ["spl", "spal"];
  description = "Shows your average scrobbles per album";

  async run(message: Message) {
    let { username } = await this.parseMentionedUsername(message);

    let { badge, colour, image } = await this.getAuthorDetails();
    let spl = await this.calculator.avgScrobblesPerAlbum();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`${spl.bold()} scrobbles per album!`);

    await message.channel.send(embed);
  }
}
