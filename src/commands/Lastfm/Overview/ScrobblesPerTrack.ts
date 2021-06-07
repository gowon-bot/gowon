import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerTrack extends OverviewChildCommand {
  idSeed = "twice jeongyeon";

  aliases = ["spt"];
  description = "Shows your average scrobbles per track";

  async run() {
    let { perspective } = await this.parseMentions();

    let spt = await this.calculator.avgScrobblesPerTrack();

    let embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.regularVerb(
        "average"
      )} ${spt.asString.strong()} scrobbles per track!`
    );

    await this.send(embed);
  }
}
