import { OverviewChildCommand } from "./OverviewChildCommand";
import { MessageEmbed } from "discord.js";

export class ScrobblesPerAlbum extends OverviewChildCommand {
  aliases = ["spl", "spal"];
  description = "Shows your average scrobbles per album";

  async run() {
    let { username } = await this.parseMentionedUsername();

    let { badge, colour, image } = await this.getAuthorDetails();
    let spl = await this.calculator.avgScrobblesPerAlbum();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`${spl.asString.bold()} scrobbles per album!`);

    await this.send(embed);
  }
}
