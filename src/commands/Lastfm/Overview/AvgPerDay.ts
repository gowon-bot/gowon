import { bold } from "../../../helpers/discord";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class AvgPerDay extends OverviewChildCommand {
  idSeed = "snsd taeyeon";

  aliases = ["avg", "average", "daily", "spd"];
  description = "Shows your average scrobble count per day";

  slashCommand = true;

  async run() {
    let { perspective } = await this.getMentions();

    let avg = await this.calculator.avgPerDay();

    let embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.plusToHave} an average ${bold(
        avg.asString
      )} scrobbles per day!`
    );

    await this.send(embed);
  }
}
