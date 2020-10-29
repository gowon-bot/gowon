import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerArtist extends OverviewChildCommand {
  aliases = ["spa"];
  description = "Shows your average scrobbles per artist";

  async run() {
    let { username } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let spa = await this.calculator.avgScrobblesPerArtist();

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`${spa.asString.bold()} scrobbles per artist!`);

    await this.send(embed);
  }
}
