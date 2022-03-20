import { bold } from "../../../helpers/discord";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerArtist extends OverviewChildCommand {
  idSeed = "twice nayeon";

  aliases = ["spa"];
  description = "Shows your average scrobbles per artist";

  async run() {
    let { perspective } = await this.getMentions();

    let spa = await this.calculator.avgScrobblesPerArtist();

    let embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.regularVerb("average")} ${bold(
        spa.asString
      )} scrobbles per artist!`
    );

    await this.send(embed);
  }
}
