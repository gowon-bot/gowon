import { BaseCommand } from "../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../arguments";

export default class Cover extends BaseCommand {
  aliases = ["co"];
  description = "Shows the cover for an album";
  arguments: Arguments = {
    mentions: {
      0: { name: "user", description: "the user to lookup" },
    },
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string,
      albumName = this.parsedArguments.album as string;

    let { username } = await this.parseMentionedUsername(message);

    if (!artist || !albumName) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(username);

      if (!artist) artist = nowPlaying.artist;
      if (!albumName) albumName = nowPlaying.album;
    }

    let albumDetails = await this.lastFMService.albumInfo(artist, albumName);
    let image = albumDetails.image.find((i) => i.size === "extralarge");

    message.channel.send(
      `Cover for **${albumDetails.name}** by **${albumDetails.artist}**`,
      { files: [image?.["#text"] ?? ""] }
    );
  }
}
