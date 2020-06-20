import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TrackAt extends LastFMBaseCommand {
  aliases = ["ta"];
  description = "Finds the track at a certain rank";
  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
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
      }** in ${perspective.possessive} top tracks with ${numberDisplay(
        track.playcount,
        "play"
      )}`
    );
  }
}
