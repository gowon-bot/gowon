import { OverviewChildCommand } from "./OverviewChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { numberDisplay } from "../../helpers";

export class Crowns extends OverviewChildCommand {
  aliases = ["c", "cw"];
  description = "Shows some stats about crowns";

  async run(message: Message) {
    let { badge, colour, image } = await this.getAuthorDetails();
    let { username } = await this.parseMentionedUsername(message);

    let [crownCount, apc, spc] = await Promise.all([
      this.calculator.totalCrowns(),
      this.calculator.artistsPerCrown(),
      this.calculator.scrobblesPerCrown(),
    ]);

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour).setDescription(`You have ${numberDisplay(
      crownCount,
      "crown"
    ).bold()}
      For every ${numberDisplay(
        apc,
        "eligible artist"
      ).bold()}, you have a crown
For every ${numberDisplay(spc, "scrobble").bold()}, you a crown
      `);

    await message.channel.send(embed);
  }
}
