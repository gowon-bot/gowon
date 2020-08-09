import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TrackPage extends LastFMBaseCommand {
  aliases = ["tpa", "tpage"];
  description = "Links you to the track page on lastfm";
  subcategory = "pages"

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
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
      trackName = this.parsedArguments.track as string;

    let { username } = await this.parseMentionedUsername(message);

    if (!artist || !trackName) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(username);

      if (!artist) artist = nowPlaying.artist;
      if (!trackName) trackName = nowPlaying.name;
    }

    let trackDetails = await this.lastFMService.trackInfo(
      artist,
      trackName,
      username
    );

    message.channel.send(
      `${trackDetails.name.italic()} by ${trackDetails.artist.name.bold()} on last.fm: ${
        trackDetails.url
      }`
    );
  }
}
