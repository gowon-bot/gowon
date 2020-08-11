import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class AlbumPage extends LastFMBaseCommand {
  aliases = ["alpa", "lpa", "alpage", "lpage"];
  description = "Links you to the album page on lastfm";
  subcategory = "pages"
  usage = ["", "artist | album"]

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
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

    let albumDetails = await this.lastFMService.albumInfo(
      artist,
      albumName,
      username
    );

    message.channel.send(
      `${albumDetails.name.italic()} by ${albumDetails.artist.bold()} on last.fm: ${
        albumDetails.url
      }`
    );
  }
}
