import { OverviewChildCommand } from "./OverviewChildCommand";
import { Message, MessageEmbed } from "discord.js";

export class Per extends OverviewChildCommand {
  aliases = ["lpa", "tpa", "tpl", "alpa", "tpal"];
  description = "Shows some averages about your library";

  async run(message: Message) {
    let { username } = await this.parseMentionedUsername(message);

    let { badge, colour, image } = await this.getAuthorDetails();
    let [lpa, tpa, tpl] = await Promise.all([
      this.calculator.albumsPerArtist(),
      this.calculator.tracksPerArtist(),
      this.calculator.tracksPerAlbum(),
    ]);

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour).setDescription(`${lpa.bold()} albums per artist!
      ${tpa.bold()} tracks per artist!
      ${tpl.bold()} tracks per album!`);

    await message.channel.send(embed);
  }
}
