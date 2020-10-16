import { OverviewChildCommand } from "./OverviewChildCommand";
import { MessageEmbed } from "discord.js";

export class Per extends OverviewChildCommand {
  aliases = ["lpa", "tpa", "tpl", "alpa", "tpal"];
  description = "Shows some averages about your library";

  async run() {
    let { username } = await this.parseMentions();

    let { badge, colour, image } = await this.getAuthorDetails();
    let [lpa, tpa, tpl] = await Promise.all([
      this.calculator.albumsPerArtist(),
      this.calculator.tracksPerArtist(),
      this.calculator.tracksPerAlbum(),
    ]);

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour).setDescription(`${lpa.asString.bold()} albums per artist!
      ${tpa.asString.bold()} tracks per artist!
      ${tpl.asString.bold()} tracks per album!`);

    await this.send(embed);
  }
}
