import { bold } from "../../../helpers/discord";
import { displayNumber } from "../../../lib/ui/displays";
import { ProfileChildCommand } from "./ProfileChildCommand";

export class Breadth extends ProfileChildCommand {
  idSeed = "snsd sunny";

  aliases = ["diversity", "div"];
  description = "Shows your breadth rating.";
  extraDescription =
    " Your breadth rating is calculated from a number of different factors, and is an attempt to quantify your musical diversity. In general, this is what increases your breadth rating:\n- A higher hindex\n- More artists making up 50% of your scrobbles\n- Less scrobbles in your top 10 artists";

  slashCommand = true;

  async run() {
    const { perspective } = await this.getMentions();

    const breadth = await this.calculator.breadth();

    const embed = (await this.profileEmbed())
      .setHeader("Profile breadth")
      .setDescription(
        `${perspective.upper.possessive} breadth rating is ${bold(
          displayNumber(breadth.rating.toFixed(1))
        )} _(${breadth.ratingString})_`
      );

    await this.send(embed);
  }
}
