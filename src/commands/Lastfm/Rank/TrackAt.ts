import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors/errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayNumber } from "../../../lib/views/displays";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { bold, italic } from "../../../helpers/discord";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

const args = {
  rank: new NumberArgument({
    description: "The rank to lookup",
    required: true,
  }),
  ...standardMentions,
} satisfies ArgumentsMap

export default class TrackAt extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature sunn";

  aliases = ["ta"];
  description = "Finds the track in your library at a given rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    rank: new validators.NumberValidator({ whole: true }),
  };

  async run() {
    let rank = this.parsedArguments.rank;

    let { requestable, perspective } = await this.getMentions();

    let topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: 1,
      page: rank,
    });

    let track = topTracks.tracks[0];

    if (!track)
      throw new LogicError(
        `${perspective.upper.name} haven't scrobbled an track at that position!`
      );

    await this.oldReply(
      `${bold(track.name)} by ${italic(track.artist.name)} is ranked at **${track.rank
      }** in ${perspective.possessive} top tracks with ${bold(
        displayNumber(track.userPlaycount, "play")
      )}`
    );
  }
}
