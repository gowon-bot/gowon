import { OverviewChildCommand } from "./OverviewChildCommand";

export class AvgPerDay extends OverviewChildCommand {
  idSeed = "snsd taeyeon";
  
  aliases = ["avg", "average", "daily", "spd"];
  description = "Shows your average scrobble count per day";

  async run() {
    let { username, perspective } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let avg = await this.calculator.avgPerDay();

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${
          perspective.upper.plusToHave
        } an average ${avg.asString.strong()} scrobbles per day!`
      );

    await this.send(embed);
  }
}
