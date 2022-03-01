import { displayNumber } from "../../../lib/views/displays";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class Breadth extends OverviewChildCommand {
  idSeed = "snsd sunny";

  aliases = ["diversity", "div"];
  description = "Shows your breadth rating.";
  extraDescription =
    " Your breadth rating is calculated from a number of different factors, and is an attempt to quantify your musical diversity. In general, this is what increases your breadth rating:\n- A higher hindex\n- More artists making up 50% of your scrobbles\n- Less scrobbles in your top 10 artists";

  slashCommand = true;

  async run() {
    let { perspective } = await this.getMentions();

    let breadth = await this.calculator.breadth();

    let embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.possessive} breadth rating is ${displayNumber(
        breadth.rating.toFixed(1)
      ).strong()} _(${breadth.ratingString})_`
    );

    await this.send(embed);
  }
}
