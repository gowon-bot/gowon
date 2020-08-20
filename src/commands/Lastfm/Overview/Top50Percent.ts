import { OverviewChildCommand } from "./OverviewChildCommand";
import { Message, MessageEmbed } from "discord.js";

export class Top50Percent extends OverviewChildCommand {
  aliases = ["toppct", "top50"];
  description =
    "Shows how many artists are needed to make 50% of your scrobbles";

  async run(message: Message) {
    let { username, perspective } = await this.parseMentionedUsername(message);

    let { badge, colour, image } = await this.getAuthorDetails();

    let toppct = await this.calculator.top50Percent();

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${toppct.bold()} artists make up 50% of ${
          perspective.possessive
        } scrobbles!`
      );

    await message.channel.send(embed);
  }
}
