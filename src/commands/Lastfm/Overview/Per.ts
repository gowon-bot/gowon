import { bold } from "../../../helpers/discord";
import { OverviewChildCommand } from "./OverviewChildCommand";

export class Per extends OverviewChildCommand {
  idSeed = "snsd yoona";

  aliases = ["lpa", "tpa", "tpl", "alpa", "tpal"];
  description = "Shows averages about your library.";
  extraDescription =
    " Average...\n- albums per artist\n- tracks per artist\n- tracks per album";

  slashCommand = true;

  async run() {
    let { perspective } = await this.getMentions();

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

    let embed = (await this.overviewEmbed())
      .setDescription(`${perspective.upper.regularVerb(
      "listen"
    )} to an average of...
      ${bold(lpa.asString)} albums per artist!
      ${bold(tpa.asString)} tracks per artist!
      ${bold(tpl.asString)} tracks per album!`);

    await this.send(embed);
  }
}
