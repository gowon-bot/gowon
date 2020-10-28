import { OverviewChildCommand } from "./OverviewChildCommand";
import { MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";

export class Top50Percent extends OverviewChildCommand {
  aliases = ["toppct", "top50"];
  description =
    "Shows how many artists are needed to make 50% of your scrobbles";

  async run() {
    let { username, perspective } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();

    let toppct = await this.calculator.top50Percent();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${toppct.count.asString.bold()} artists (a total of ${numberDisplay(
          toppct.total.asNumber,
          "scrobble"
        )}) make up 50% of ${perspective.possessive} scrobbles!`
      );

    await this.send(embed);
  }
}
