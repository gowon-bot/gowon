import { numberDisplay } from "../../../helpers";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class Playsover extends OverviewChildCommand {
  idSeed = "snsd seohyun";

  aliases = ["po"];
  description =
    "Shows how many artists you have over some common scrobble tiers";

  async run() {
    let { username, perspective } = await this.parseMentions();

    // Cache the top artists response
    await this.calculator.topArtists();

    let { badge, colour, image } = await this.getAuthorDetails();
    let artistCount = await this.calculator.totalArtists();

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour).setDescription(`Among ${
      perspective.possessivePronoun
    } top ${numberDisplay(
      artistCount.asNumber > 1000 ? 1000 : artistCount.asNumber,
      "artist"
    )}, ${perspective.plusToHave}...
    ${(await this.calculator.tierPlaysOver(this.playsoverTiers, 6))
      .map(
        (po) =>
          `**${numberDisplay(po.count, "**artist")} with ${numberDisplay(
            po.tier,
            "+ scrobble",
            true
          )}`
      )
      .join("\n")}`);

    await this.send(embed);
  }
}
