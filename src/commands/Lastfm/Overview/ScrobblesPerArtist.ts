import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerArtist extends OverviewChildCommand {
  idSeed = "twice nayeon";
  
  aliases = ["spa"];
  description = "Shows your average scrobbles per artist";

  async run() {
    let { username, perspective } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let spa = await this.calculator.avgScrobblesPerArtist();

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(
        `${perspective.upper.regularVerb(
          "average"
        )} ${spa.asString.strong()} scrobbles per artist!`
      );

    await this.send(embed);
  }
}
