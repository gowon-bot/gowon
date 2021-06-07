import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerArtist extends OverviewChildCommand {
  idSeed = "twice nayeon";

  aliases = ["spa"];
  description = "Shows your average scrobbles per artist";

  async run() {
    let { perspective } = await this.parseMentions();

    let spa = await this.calculator.avgScrobblesPerArtist();

    let embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.regularVerb(
        "average"
      )} ${spa.asString.strong()} scrobbles per artist!`
    );

    await this.send(embed);
  }
}
