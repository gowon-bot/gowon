import { BaseCommand } from "./Command";
import { Message, MessageEmbed } from "discord.js";

export class NowPlaying extends BaseCommand {
  aliases = ["np", "fm"];

  async run(message: Message) {
    let username = await this.usersService.getUsername(message.author.id);

    let response = await this.lastFMService.nowPlaying(username);

    let nowPlaying = response.recenttracks.track[0];

    let nowPlayingEmbed = new MessageEmbed()
      .setColor("#ffc107")
      .setAuthor(`Now Playing for ${response.recenttracks["@attr"].user}`)
      .setDescription(
        `**${nowPlaying.name}** by **${nowPlaying.artist["#text"]}** on _${nowPlaying.album["#text"]}_`
      )
      .setThumbnail(
        nowPlaying.image.find((i) => i.size === "large")?.["#text"] || ""
      );

    await message.channel.send(nowPlayingEmbed);
  }
}
