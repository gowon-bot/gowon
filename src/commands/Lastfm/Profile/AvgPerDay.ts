import { bold } from "../../../helpers/discord";
import { ProfileChildCommand } from "./ProfileChildCommand";

export class AvgPerDay extends ProfileChildCommand {
  idSeed = "snsd taeyeon";

  aliases = ["avg", "average", "daily", "spd"];
  description = "Shows your average scrobble count per day";

  slashCommand = true;

  async run() {
    const { perspective } = await this.getMentions();

    const avg = await this.calculator.avgPerDay();

    const embed = this.profileEmbed().setDescription(
      `${perspective.upper.plusToHave} an average ${bold(
        avg.asString
      )} scrobbles per day!`
    );

    await this.reply(embed);
  }
}
