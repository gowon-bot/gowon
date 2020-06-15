import { BaseCommand } from "../../BaseCommand";
import { Message, User } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay } from "../../helpers";

export default class TrackAt extends BaseCommand {
  aliases = ["ta", "tra"];
  description = "Finds the track at a certain rank";
  arguments: Arguments = {
    mentions: {
      0: { name: "user", description: "The user to lookup" },
    },
    inputs: {
      rank: { index: 0 },
    },
  };

  async run(message: Message) {
    let rank = parseInt(this.parsedArguments.rank as string, 10),
      user = this.parsedArguments.user as User;

    let username = await this.usersService.getUsername(
      user?.id || message.author.id
    );

    let topTracks = await this.lastFMService.topTracks(username, 1, rank);

    let track = topTracks.toptracks.track[0]

    await message.reply(
      `**${track.name}** by _${track.artist.name}_ is ranked at **${
        track["@attr"].rank
      }** in your top albums with ${numberDisplay(track.playcount, "play")}`
    );
  }
}
