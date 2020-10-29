import { OverviewChildCommand } from "./OverviewChildCommand";
import { numberDisplay, getOrdinal } from "../../../helpers";
import { LogicError } from "../../../errors";

export class Crowns extends OverviewChildCommand {
  aliases = ["cw", "cws"];
  description = "Shows some stats about crowns";

  async run() {
    let { badge, colour, image } = await this.getAuthorDetails();
    let { username, perspective } = await this.parseMentions();

    let [crownRank, apc, spc] = await Promise.all([
      this.calculator.crownsRank(),
      this.calculator.artistsPerCrown(),
      this.calculator.scrobblesPerCrown(),
    ]);

    if (!crownRank?.count?.toInt())
      throw new LogicError(
        `${perspective.upper.plusToHave} no crowns in this server!`
      );

    if (await this.calculator.hasCrownStats()) {
      let embed = this.newEmbed()
        .setAuthor(username + badge, image)
        .setColor(colour).setDescription(`You have ${numberDisplay(
        crownRank!.count,
        "crown"
      ).bold()} (ranked ${getOrdinal(crownRank!.rank.toInt()).italic()})
        For every ${numberDisplay(apc!.asNumber, "eligible artist").bold()}, ${
        perspective.plusToHave
      } a crown
  For every ${numberDisplay(spc!.asNumber, "scrobble").bold()}, ${
        perspective.plusToHave
      } a crown
        `);

      await this.send(embed);
    } else {
      throw new LogicError(
        "that user isn't logged into the bot or doesn't have any crowns!"
      );
    }
  }
}
