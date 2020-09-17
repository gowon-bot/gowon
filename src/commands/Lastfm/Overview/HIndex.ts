import { OverviewChildCommand } from "./OverviewChildCommand";
import { MessageEmbed } from "discord.js";

export class HIndex extends OverviewChildCommand {
  aliases = ["hidx", "hdx"];
  description = "Shows your H-index (!hindex for more information)";

  async run() {
    let { username, perspective } = await this.parseMentionedUsername();

    let { badge, colour, image } = await this.getAuthorDetails();
    let hindex = await this.calculator.hIndex();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`${perspective.possessive} H-index is ${hindex.asString.bold()}!`);

    await this.send(embed);
  }
}
