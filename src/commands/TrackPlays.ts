import { BaseCommand } from "../BaseCommand";
import { Message, User } from "discord.js";
import { Arguments } from "../arguments";
import { numberDisplay } from "../helpers";

export class TrackPlays extends BaseCommand {
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
      trackName = this.parsedArguments.track as string,
      user = this.parsedArguments.user as User;

    let senderUsername = await this.usersService.getUsername(message.author.id);
    let mentionedUsername = await this.usersService.getUsername(user?.id);

    let username = mentionedUsername || senderUsername;

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
      `\`${username}\` has ${numberDisplay(
        trackDetails.track.userplaycount,
        "scrobble"
      )} of **${trackDetails.track.name}** by ${trackDetails.track.artist.name}`
    );
  }
}
