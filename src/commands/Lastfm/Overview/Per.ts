import { OverviewChildCommand } from "./OverviewChildCommand";

export class Per extends OverviewChildCommand {
  aliases = ["lpa", "tpa", "tpl", "alpa", "tpal"];
  description = "Shows averages about your library. Average...\n- albums per artist\n- tracks per artist\n- tracks per album";

  async run() {
    let { username } = await this.parseMentions();

    // Cache the top entities responses
    await Promise.all([
      this.calculator.topArtists(),
      this.calculator.topAlbums(),
      this.calculator.topTracks(),
    ]);

    let { badge, colour, image } = await this.getAuthorDetails();
    let [lpa, tpa, tpl] = await Promise.all([
      this.calculator.albumsPerArtist(),
      this.calculator.tracksPerArtist(),
      this.calculator.tracksPerAlbum(),
    ]);

    let embed = this.newEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour)
      .setDescription(`${lpa.asString.bold()} albums per artist!
      ${tpa.asString.bold()} tracks per artist!
      ${tpl.asString.bold()} tracks per album!`);

    await this.send(embed);
  }
}
