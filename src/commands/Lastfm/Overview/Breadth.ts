import { OverviewChildCommand } from "./OverviewChildCommand";
import { MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";

export class Breadth extends OverviewChildCommand {
  aliases = ["diversity", "div"];
  description = "Shows your breadth rating";

  async run() {
    let { username, perspective } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let breadth = await this.calculator.breadth();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${(perspective.upper.possessive)} breadth rating is ${numberDisplay(
          breadth.rating.toFixed(1)
        ).bold()} _(${breadth.ratingString})_`
      );

    await this.send(embed);
  }
}
