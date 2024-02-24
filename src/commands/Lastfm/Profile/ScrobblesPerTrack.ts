import { bold } from "../../../helpers/discord";
import { ProfileChildCommand } from "./ProfileChildCommand";

export class ScrobblesPerTrack extends ProfileChildCommand {
  idSeed = "twice jeongyeon";

  aliases = ["spt"];
  description = "Shows your average scrobbles per track";

  async run() {
    const { perspective } = await this.getMentions();

    const spt = await this.calculator.avgScrobblesPerTrack();

    const embed = this.profileEmbed().setDescription(
      `${perspective.upper.regularVerb("average")} ${bold(
        spt.asString
      )} scrobbles per track!`
    );

    await this.reply(embed);
  }
}
