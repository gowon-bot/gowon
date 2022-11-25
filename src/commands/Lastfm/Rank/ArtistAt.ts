import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors/errors";
import { validators } from "../../../lib/validation/validators";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { bold } from "../../../helpers/discord";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

const args = {
  rank: new NumberArgument({
    description: "The rank to lookup",
    required: true,
  }),
  ...standardMentions,
} satisfies ArgumentsMap

export default class ArtistAt extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature jeewon";

  aliases = ["aa"];
  description = "Finds the artist in your library at a given rank";
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

    let topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1,
      page: rank,
    });

    let artist = topArtists.artists[0];

    if (!artist)
      throw new LogicError(
        `${perspective.upper.name} haven't scrobbled an artist at that position!`
      );

    await this.oldReply(
      `${bold(artist.name)} is ranked at #**${artist.rank}** in ${perspective.possessive
      } top artists with ${bold(displayNumber(artist.userPlaycount, "play"))}`
    );
  }
}
