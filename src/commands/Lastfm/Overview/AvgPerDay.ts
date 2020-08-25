import { OverviewChildCommand } from "./OverviewChildCommand";
import { MessageEmbed } from "discord.js";

export class AvgPerDay extends OverviewChildCommand {
  aliases = ["avg", "average", "daily"];
  description = "Shows your average scrobble count per day";

  async run() {
    let { username } = await this.parseMentionedUsername();

    let { badge, colour, image } = await this.getAuthorDetails();
    let avg = await this.calculator.avgPerDay();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`${avg.bold()} scrobbles per day!`);

    await this.send(embed);
  }
}
