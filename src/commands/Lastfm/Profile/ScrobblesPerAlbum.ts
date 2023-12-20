import { bold } from "../../../helpers/discord";
import { ProfileChildCommand } from "./ProfileChildCommand";

export class ScrobblesPerAlbum extends ProfileChildCommand {
  idSeed = "snsd jessica";

  aliases = ["spl", "spal"];
  description = "Shows your average scrobbles per album";

  async run() {
    const { perspective } = await this.getMentions();

    const spl = await this.calculator.avgScrobblesPerAlbum();

    const embed = (await this.profileEmbed())
      .setHeader("Profile scrobbles per album")
      .setDescription(
        `${perspective.upper.regularVerb("average")} ${bold(
          spl.asString
        )} scrobbles per album!`
      );

    await this.send(embed);
  }
}
