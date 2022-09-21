import { displayNumber } from "../../../lib/views/displays";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class Playsover extends OverviewChildCommand {
  idSeed = "snsd seohyun";

  aliases = ["po"];
  description =
    "Shows how many artists you have over some common scrobble tiers";

  slashCommand = true;

  async run() {
    const { perspective } = await this.getMentions();

    // Cache the top artists response
    await this.calculator.topArtists();

    const artistCount = await this.calculator.totalArtists();

    const embed = (await this.overviewEmbed()).setDescription(`Among ${
      perspective.possessivePronoun
    } top ${displayNumber(
      artistCount.asNumber > 1000 ? 1000 : artistCount.asNumber,
      "artist"
    )}, ${perspective.plusToHave}...
    ${(await this.calculator.tierPlaysOver(this.playsoverTiers, 6))
      .map(
        (po) =>
          `**${displayNumber(po.count, "**artist")} with ${displayNumber(
            po.tier,
            "+ scrobble",
            true
          )}`
      )
      .join("\n")}`);

    await this.send(embed);
  }
}
