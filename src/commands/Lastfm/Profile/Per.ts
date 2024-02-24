import { bold } from "../../../helpers/discord";
import { ProfileChildCommand } from "./ProfileChildCommand";

export class Per extends ProfileChildCommand {
  idSeed = "snsd yoona";

  aliases = ["lpa", "tpa", "tpl", "alpa", "tpal"];
  description = "Shows averages about your library.";
  extraDescription =
    " Average...\n- albums per artist\n- tracks per artist\n- tracks per album";

  slashCommand = true;

  async run() {
    const { perspective } = await this.getMentions();

    // Cache the top entities responses
    await Promise.all([
      this.calculator.topArtists(),
      this.calculator.topAlbums(),
      this.calculator.topTracks(),
    ]);

    const [lpa, tpa, tpl] = await Promise.all([
      this.calculator.albumsPerArtist(),
      this.calculator.tracksPerArtist(),
      this.calculator.tracksPerAlbum(),
    ]);

    const embed = this.profileEmbed()
      .setDescription(`${perspective.upper.regularVerb(
      "listen"
    )} to an average of...
      ${bold(lpa.asString)} albums per artist!
      ${bold(tpa.asString)} tracks per artist!
      ${bold(tpl.asString)} tracks per album!`);

    await this.reply(embed);
  }
}
