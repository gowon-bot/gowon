import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { numberDisplay } from "../../helpers";

export default class TrackAt extends BaseCommand {
  aliases = ["ta"];
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
    let rank = parseInt(this.parsedArguments.rank as string, 10);

    if (isNaN(rank) || rank < 0 || rank > 1000) {
      await message.reply("please enter a valid rank (1-1000)");
      return;
    }

    let { username, perspective } = await this.parseMentionedUsername(message);

    let topTracks = await this.lastFMService.topTracks(username, 1, rank);

    let track = topTracks.track[0];

    await message.reply(
      `**${track.name}** by _${track.artist.name}_ is ranked at **${
        track["@attr"].rank
      }** in ${perspective.possessive} top albums with ${numberDisplay(
        track.playcount,
        "play"
      )}`
    );
  }
}
