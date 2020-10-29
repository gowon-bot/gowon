import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerTrack extends OverviewChildCommand {
  aliases = ["spt"];
  description = "Shows your average scrobbles per track";

  async run() {
    let { username } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let spt = await this.calculator.avgScrobblesPerTrack();

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`${spt.asString.bold()} scrobbles per track!`);

    await this.send(embed);
  }
}
