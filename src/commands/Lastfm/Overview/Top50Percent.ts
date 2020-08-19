import { OverviewChildCommand } from "./OverviewChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { OverviewStatsCalculator } from "../../../lib/calculators/OverviewStatsCalculator";

export class Top50Percent extends OverviewChildCommand {
  aliases = ["toppct", "top50"];
  description =
    "Shows how many artists are needed to make 50% of your scrobbles";

  arguments: Arguments = {
    inputs: {
      usernames: { index: { start: 0 }, join: false },
    },
  };

  async run(message: Message) {
    // let { username, perspective } = await this.parseMentionedUsername(message);

    let usernames = this.parsedArguments.usernames as string[];

    for (let username of usernames) {
      // let { badge, colour, image } = await this.getAuthorDetails();
      this.calculator = new OverviewStatsCalculator(
        username,
        message.guild?.id!
      );
      let toppct = await this.calculator.top50Percent();

      let embed = new MessageEmbed()
        // .setAuthor(username + badge, image)
        .setAuthor(username)
        // .setColor(colour)
        .setDescription(
          `${toppct.bold()} artists make up 50% of ${
            "their" // perspective.possessive
          } scrobbles!`
        );

      await message.channel.send(embed);
    }
  }
}
