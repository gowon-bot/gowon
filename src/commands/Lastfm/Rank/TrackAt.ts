import { LogicError } from "../../../errors/errors";
import { bold, italic } from "../../../helpers/discord";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayNumber } from "../../../lib/views/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  rank: new NumberArgument({
    description: "The rank to lookup",
    required: true,
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

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
    const rank = this.parsedArguments.rank;

    const { requestable, perspective } = await this.getMentions();

    const topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: 1,
      page: rank,
    });

    const track = topTracks.tracks[0];

    if (!track)
      throw new LogicError(
        `${perspective.upper.name} haven't scrobbled an track at that position!`
      );

    await this.oldReply(
      `${bold(track.name)} by ${italic(track.artist.name)} is ranked at **${
        track.rank
      }** in ${perspective.possessive} top tracks with ${bold(
        displayNumber(track.userPlaycount, "play")
      )}`
    );
  }
}
