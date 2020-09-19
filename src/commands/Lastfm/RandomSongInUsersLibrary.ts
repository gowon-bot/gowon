import { MessageEmbed } from "discord.js";
import { getOrdinal } from "../../helpers";
import { Arguments } from "../../lib/arguments/arguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class RandomsongInUsersLibrary extends LastFMBaseCommand {
  shouldBeIndexed = false;

  arguments: Arguments = {
    mentions: {
      user: { index: 0, nonDiscordMentionParsing: this.ndmp },
    },
  };

  async run() {
    let { username } = await this.parseMentionedUsername();

    let trackCount = await this.lastFMService.trackCount(username);

    let randomIndex = Math.floor(Math.random() * ((trackCount - 1) / 2));

    randomIndex = randomIndex < 0 ? 0 : randomIndex;

    let randomSong = (
      await this.lastFMService.topTracks({
        username,
        limit: 1,
        page: randomIndex,
      })
    ).track[0];

    let trackInfo = await this.lastFMService.trackInfo({
      track: randomSong.name,
      artist: randomSong.artist.name,
    });

    let embed = new MessageEmbed()
      .setAuthor(`${username}'s ${getOrdinal(randomIndex - 1)} top track`)
      .setTitle(randomSong.name)
      .setDescription(
        `by ${randomSong.artist.name.bold()}` +
          (trackInfo.album ? ` from ${trackInfo.album.title.italic()}` : "")
      )
      .setThumbnail(
        trackInfo.album?.image.find((i) => i.size === "large")?.["#text"] || ""
      );

    await this.send(embed);
  }
}
