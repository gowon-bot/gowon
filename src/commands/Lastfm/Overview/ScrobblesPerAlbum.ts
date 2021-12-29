import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerAlbum extends OverviewChildCommand {
  idSeed = "snsd jessica";

  aliases = ["spl", "spal"];
  description = "Shows your average scrobbles per album";

  async run() {
    let { perspective } = await this.getMentions();

    let spl = await this.calculator.avgScrobblesPerAlbum();

    let embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.regularVerb(
        "average"
      )} ${spl.asString.strong()} scrobbles per album!`
    );

    await this.send(embed);
  }
}
