import { MessageEmbed } from "discord.js";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class Randomsong extends LastFMBaseCommand {
  description = "Picks a random song";
  usage = "";

  async run() {
    let randomUser = await this.usersService.randomUser();

    let randomSongs = await this.lastFMService.recentTracks({
      username: randomUser.lastFMUsername,
      limit: 100,
    });

    let randomSong =
      randomSongs.track[~~(randomSongs.track.length * Math.random())];

    let embed = new MessageEmbed()
      .setAuthor(`Scrobbled by ${randomUser.lastFMUsername}`)
      .setTitle(randomSong.name)
      .setDescription(
        `by ${randomSong.artist["#text"].bold()}` +
          (randomSong.album["#text"]
            ? ` from ${randomSong.album["#text"].italic()}`
            : "")
      )
      .setThumbnail(
        randomSong.image.find((i) => i.size === "large")?.["#text"] || ""
      );

    await this.send(embed);
  }
}
