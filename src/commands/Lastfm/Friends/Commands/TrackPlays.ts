import { FriendsChildCommand } from "../FriendsChildCommand";
import { MessageEmbed } from "discord.js";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { numberDisplay } from "../../../../helpers";
import { Arguments } from "../../../../lib/arguments/arguments";

export class TrackPlays extends FriendsChildCommand {
  description = "View how many plays of a track your friends have";
  aliases = ["tp"];
  usage = ["", "artist | track"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      track: { index: 1, splitOn: "|" },
    },
  };

  throwIfNoFriends = true;

  async run() {
    let artist = this.parsedArguments.artist as string,
      track = this.parsedArguments.track as string;

    if (!artist || !track) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        this.senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!track) track = nowPlaying.name;
    }

    let trackDetails = await new MultiRequester([
      ...this.friendUsernames,
      this.senderUsername,
    ]).fetch(this.lastFMService.trackInfo.bind(this.lastFMService), {
      artist,
      track,
    });

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

    await this.send(embed);
  }
}
