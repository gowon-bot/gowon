import { OverviewChildCommand } from "./OverviewChildCommand";
import { MessageEmbed } from "discord.js";

export class Joined extends OverviewChildCommand {
  aliases = ["j", "join"];
  description = "Shows when a user joined";

  async run() {
    let { username } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let joined = await this.calculator.joined();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`Scrobbling since ${joined}`);

    await this.send(embed);
  }
}
