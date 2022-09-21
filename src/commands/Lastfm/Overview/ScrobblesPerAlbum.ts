import { bold } from "../../../helpers/discord";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class ScrobblesPerAlbum extends OverviewChildCommand {
  idSeed = "snsd jessica";

  aliases = ["spl", "spal"];
  description = "Shows your average scrobbles per album";

  async run() {
    const { perspective } = await this.getMentions();

    const spl = await this.calculator.avgScrobblesPerAlbum();

    const embed = (await this.overviewEmbed()).setDescription(
      `${perspective.upper.regularVerb("average")} ${bold(
        spl.asString
      )} scrobbles per album!`
    );

    await this.send(embed);
  }
}
