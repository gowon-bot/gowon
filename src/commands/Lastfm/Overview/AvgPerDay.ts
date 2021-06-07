import { OverviewChildCommand } from "./OverviewChildCommand";

export class AvgPerDay extends OverviewChildCommand {
  idSeed = "snsd taeyeon";

  aliases = ["avg", "average", "daily", "spd"];
  description = "Shows your average scrobble count per day";

  async run() {
    let { perspective } = await this.parseMentions();

    let avg = await this.calculator.avgPerDay();

    let embed = (await this.overviewEmbed()).setDescription(
      `${
        perspective.upper.plusToHave
      } an average ${avg.asString.strong()} scrobbles per day!`
    );

    await this.send(embed);
  }
}
