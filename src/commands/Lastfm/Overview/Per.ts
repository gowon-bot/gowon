import { OverviewChildCommand } from "./OverviewChildCommand";

export class Per extends OverviewChildCommand {
  idSeed = "snsd yoona";

  aliases = ["lpa", "tpa", "tpl", "alpa", "tpal"];
  description =
    "Shows averages about your library. Average...\n- albums per artist\n- tracks per artist\n- tracks per album";

  async run() {
    let { perspective } = await this.parseMentions();

    // Cache the top entities responses
    await Promise.all([
      this.calculator.topArtists(),
      this.calculator.topAlbums(),
      this.calculator.topTracks(),
    ]);

    let [lpa, tpa, tpl] = await Promise.all([
      this.calculator.albumsPerArtist(),
      this.calculator.tracksPerArtist(),
      this.calculator.tracksPerAlbum(),
    ]);

    let embed = (await this.overviewEmbed())
      .setDescription(`${perspective.upper.regularVerb(
      "listen"
    )} to an average of...
      ${lpa.asString.strong()} albums per artist!
      ${tpa.asString.strong()} tracks per artist!
      ${tpl.asString.strong()} tracks per album!`);

    await this.send(embed);
  }
}
