import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerAlbum extends OverviewChildCommand {
  idSeed = "snsd jessica";

  aliases = ["spl", "spal"];
  description = "Shows your average scrobbles per album";

  async run() {
    let { username, perspective } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let spl = await this.calculator.avgScrobblesPerAlbum();

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${perspective.upper.regularVerb(
          "average"
        )} ${spl.asString.strong()} scrobbles per album!`
      );

    await this.send(embed);
  }
}
