import { OverviewChildCommand } from "./OverviewChildCommand";
import { Message, MessageEmbed } from "discord.js";

export class ScrobblesPerArtist extends OverviewChildCommand {
  aliases = ["spa"];
  description = "Shows your average scrobbles per artist";

  async run(message: Message) {
    let { username } = await this.parseMentionedUsername(message);

    let { badge, colour, image } = await this.getAuthorDetails();
    let spa = await this.calculator.avgScrobblesPerArtist();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`${spa.bold()} scrobbles per artist!`);

    await message.channel.send(embed);
  }
}
