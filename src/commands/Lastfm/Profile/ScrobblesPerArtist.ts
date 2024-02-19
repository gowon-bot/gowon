import { bold } from "../../../helpers/discord";
import { ProfileChildCommand } from "./ProfileChildCommand";

export class ScrobblesPerArtist extends ProfileChildCommand {
  idSeed = "twice nayeon";

  aliases = ["spa"];
  description = "Shows your average scrobbles per artist";

  async run() {
    const { perspective } = await this.getMentions();

    const spa = await this.calculator.avgScrobblesPerArtist();

    const embed = this.profileEmbed().setDescription(
      `${perspective.upper.regularVerb("average")} ${bold(
        spa.asString
      )} scrobbles per artist!`
    );

    await this.reply(embed);
  }
}
