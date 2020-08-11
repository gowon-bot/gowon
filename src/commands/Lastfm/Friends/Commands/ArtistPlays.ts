import { FriendsChildCommand } from "../FriendsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { FriendsRequester } from "../../../../lib/FriendsRequester";
import { numberDisplay } from "../../../../helpers";
import { Arguments } from "../../../../lib/arguments/arguments";

export class ArtistPlays extends FriendsChildCommand {
  description = "View how many plays of an artist your friends have";
  aliases = ["p"];
  usage = ["", "artist"]

  arguments: Arguments = {
    inputs: {
      artist: {
        index: {
          start: 0,
        },
      },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(this.senderUsername))
        .artist;
    }

    let artistDetails = await new FriendsRequester(this.friendUsernames).fetch(
      this.lastFMService.artistInfo.bind(this.lastFMService),
      [artist],
      {
        usernameInPosition: 1,
      }
    );

    let artistName = Object.values(artistDetails).filter(v => v.name)[0].name

    let embed = new MessageEmbed()
      .setTitle(`Your friends plays of ${artistName}`)
      .setDescription(
        Object.keys(artistDetails)
          .sort(
            (a, b) =>
              artistDetails[b].stats.userplaycount.toInt() -
              artistDetails[a].stats.userplaycount.toInt()
          )
          .map((username) => {
            let ad = artistDetails[username];

            return `${username.code()} - **${numberDisplay(
              ad.stats.userplaycount,
              "**scrobble"
            )} of **${ad.name}**`;
          })
      );

    await message.channel.send(embed);
  }
}
