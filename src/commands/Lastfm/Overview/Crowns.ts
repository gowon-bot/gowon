import { OverviewChildCommand } from "./OverviewChildCommand";
import { MessageEmbed } from "discord.js";
import { numberDisplay, getOrdinal } from "../../../helpers";
import { LogicError } from "../../../errors";

export class Crowns extends OverviewChildCommand {
  aliases = ["cw", "cws"];
  description = "Shows some stats about crowns";

  async run() {
    let { badge, colour, image } = await this.getAuthorDetails();
    let { username } = await this.parseMentionedUsername();

    let [crownRank, apc, spc] = await Promise.all([
      this.calculator.crownsRank(),
      this.calculator.artistsPerCrown(),
      this.calculator.scrobblesPerCrown(),
    ]);

    if (await this.calculator.hasCrownStats()) {
      let embed = new MessageEmbed()
        .setAuthor(username + badge, image)
        .setColor(colour).setDescription(`You have ${numberDisplay(
        crownRank!.count,
        "crown"
      ).bold()} (ranked ${getOrdinal(crownRank!.rank.toInt()).italic()})
        For every ${numberDisplay(
          apc!,
          "eligible artist"
        ).bold()}, you have a crown
  For every ${numberDisplay(spc!, "scrobble").bold()}, you a crown
        `);

      await this.send(embed);
    } else {
      throw new LogicError(
        "that user isn't logged into the bot or doesn't have any crowns!"
      );
    }
  }
}
