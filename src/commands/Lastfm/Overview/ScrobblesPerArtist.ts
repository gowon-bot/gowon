import { bold } from "../../../helpers/discord";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerArtist extends OverviewChildCommand {
  idSeed = "twice nayeon";

  aliases = ["spa"];
  description = "Shows your average scrobbles per artist";

  async run() {
    const { perspective } = await this.getMentions();

    const spa = await this.calculator.avgScrobblesPerArtist();

    const embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.regularVerb("average")} ${bold(
        spa.asString
      )} scrobbles per artist!`
    );

    await this.send(embed);
  }
}
