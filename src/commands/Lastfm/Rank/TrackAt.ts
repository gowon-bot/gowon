import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

const args = {
  inputs: {
    rank: { index: 0, default: 1, number: true },
  },
} as const;

export default class TrackAt extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature sunn";

  aliases = ["ta"];
  description = "Finds the track in your library at a given rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  arguments: Arguments = args;

  validation: Validation = {
    rank: new validators.Number({ whole: true }),
  };

  async run() {
    let rank = this.parsedArguments.rank;

    let { username, perspective } = await this.parseMentions();

    let topTracks = await this.lastFMService.topTracks({
      username,
      limit: 1,
      page: rank,
    });

    let track = topTracks.track[0];

    if (!track)
      throw new LogicError(
        `${perspective.upper.name} haven't scrobbled an album at that position!`
      );

    await this.traditionalReply(
      `${track.name.strong()} by ${track.artist.name.italic()} is ranked at ${track[
        "@attr"
      ].rank.strong()} in ${
        perspective.possessive
      } top tracks with ${numberDisplay(track.playcount, "play").strong()}`
    );
  }
}
