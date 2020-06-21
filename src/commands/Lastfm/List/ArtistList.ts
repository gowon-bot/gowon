import { Message, MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";
import { ListChildCommand } from "./ListChildCommand";

export class ArtistList extends ListChildCommand {
  aliases = ["alist", "topartists"];
  description = "Shows your top artists";

  async run(message: Message) {
    let { username } = await this.parseMentionedUsername(message);

    let topArtists = await this.lastFMService.topArtists(
      username,
      this.listAmount,
      1,
      this.timePeriod
    );

    let messageEmbed = new MessageEmbed()
      .setTitle(
        `Top ${numberDisplay(this.listAmount, "artist")} for \`${username}\` ${
          this.humanReadableTimePeriod
        }`
      )
      .setDescription(
        topArtists.artist
          .map((a) => `${numberDisplay(a.playcount, "play")} - **${a.name}**`)
          .join("\n")
      );

    await message.channel.send(messageEmbed);
  }
}
