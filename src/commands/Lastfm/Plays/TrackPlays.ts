import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay, ucFirst } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TrackPlays extends LastFMBaseCommand {
  aliases = ["tp"];
  description = "Shows you how many plays you have of a given track";

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

    let {
      username,
      senderUsername,
      perspective,
    } = await this.parseMentionedUsername(message);

    if (!artist || !trackName) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!trackName) trackName = nowPlaying.name;
    }

    let trackDetails = await this.lastFMService.trackInfo(
      artist,
      trackName,
      username
    );

    message.channel.send(
      `${ucFirst(perspective.plusToHave)} **${numberDisplay(
        trackDetails.userplaycount,
        "**scrobble"
      )} of **${trackDetails.name}** by ${trackDetails.artist.name}`
    );
  }
}
