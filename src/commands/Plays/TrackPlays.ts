import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay, ucFirst } from "../../helpers";

export default class TrackPlays extends BaseCommand {
  aliases = ["tp"];
  description = "Shows you how many plays you have of a given track";

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
    mentions: {
      0: { name: "user", description: "The user to lookup" },
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
      `${ucFirst(perspective.plusToHave)} has ${numberDisplay(
        trackDetails.userplaycount,
        "scrobble"
      )} of **${trackDetails.name}** by ${trackDetails.artist.name}`
    );
  }
}
