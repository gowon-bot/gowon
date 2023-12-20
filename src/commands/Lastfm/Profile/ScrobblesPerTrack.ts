import { bold } from "../../../helpers/discord";
import { ProfileChildCommand } from "./ProfileChildCommand";

export class ScrobblesPerTrack extends ProfileChildCommand {
  idSeed = "twice jeongyeon";

  aliases = ["spt"];
  description = "Shows your average scrobbles per track";

  async run() {
    const { perspective } = await this.getMentions();

    const spt = await this.calculator.avgScrobblesPerTrack();

    const embed = (await this.profileEmbed())
      .setHeader("Profile scrobbles per track")
      .setDescription(
        `${perspective.upper.regularVerb("average")} ${bold(
          spt.asString
        )} scrobbles per track!`
      );

    await this.send(embed);
  }
}
