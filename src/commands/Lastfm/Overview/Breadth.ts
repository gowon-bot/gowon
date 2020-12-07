import { OverviewChildCommand } from "./OverviewChildCommand";
import { numberDisplay } from "../../../helpers";

export class Breadth extends OverviewChildCommand {
  idSeed = "snsd sunny";
  
  aliases = ["diversity", "div"];
  description =
    "Shows your breadth rating. Your breadth rating is calculated from a number of different factors, and is an attempt to quantify your musical diversity. In general, this is what increases your breadth rating:\n- A higher hindex\n- More artists making up 50% of your scrobbles\n- Less scrobbles in your top 10 artists";

  async run() {
    let { username, perspective } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let breadth = await this.calculator.breadth();

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${perspective.upper.possessive} breadth rating is ${numberDisplay(
          breadth.rating.toFixed(1)
        ).strong()} _(${breadth.ratingString})_`
      );

    await this.send(embed);
  }
}
