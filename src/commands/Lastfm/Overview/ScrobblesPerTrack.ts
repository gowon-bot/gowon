import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerTrack extends OverviewChildCommand {
  aliases = ["spt"];
  description = "Shows your average scrobbles per track";

  async run() {
    let { username, perspective } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let spt = await this.calculator.avgScrobblesPerTrack();

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${perspective.upper.regularVerb(
          "average"
        )} ${spt.asString.strong()} scrobbles per track!`
      );

    await this.send(embed);
  }
}
