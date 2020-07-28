import { FriendsChildCommand } from "../FriendsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { FriendsRequester } from "../../../../lib/FriendsRequester";
import { numberDisplay } from "../../../../helpers";
import { Arguments } from "../../../../lib/arguments/arguments";

export class TrackPlays extends FriendsChildCommand {
  description = "View how many plays of a track your friends have";
  aliases = ["tp"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string,
      trackName = this.parsedArguments.track as string;

    if (!artist || !trackName) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        this.senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!trackName) trackName = nowPlaying.name;
    }

    let trackDetails = await new FriendsRequester(this.friendUsernames).fetch(
      this.lastFMService.trackInfo.bind(this.lastFMService),
      [artist, trackName],
      {
        usernameInPosition: 2,
      }
    );

    let trackInfo = Object.values(trackDetails).filter((v) => v.name)[0];

    let embed = new MessageEmbed()
      .setTitle(
        `Your friends plays of ${trackInfo.name} by ${trackInfo.artist.name}`
      )
      .setDescription(
        Object.keys(trackDetails)
          .sort(
            (a, b) =>
              trackDetails[b].userplaycount.toInt() -
              trackDetails[a].userplaycount.toInt()
          )
          .map((username) => {
            let td = trackDetails[username];

            return `${username.code()} - **${numberDisplay(
              td.userplaycount,
              "**scrobble"
            )} of **${td.name}**`;
          })
      );

    await message.channel.send(embed);
  }
}
