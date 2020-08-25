import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay, ucFirst } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";

export default class TrackAt extends LastFMBaseCommand {
  aliases = ["ta"];
  description = "Finds the track at a certain rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      rank: { index: 0, default: 1, number: true },
    },
  };

  async run() {
    let rank = this.parsedArguments.rank as number;

    if (isNaN(rank) || rank < 0) {
      await this.reply("please enter a valid rank");
      return;
    }

    let { username, perspective } = await this.parseMentionedUsername();

    let topTracks = await this.lastFMService.topTracks({
      username,
      limit: 1,
      page: rank,
    });

    let track = topTracks.track[0];

    if (!track)
      throw new LogicError(
        `${ucFirst(
          perspective.name
        )} haven't scrobbled an album at that position!`
      );

    await this.reply(
      `${track.name.bold()} by ${track.artist.name.italic()} is ranked at ${track[
        "@attr"
      ].rank.bold()} in ${
        perspective.possessive
      } top tracks with ${numberDisplay(track.playcount, "play").bold()}`
    );
  }
}
