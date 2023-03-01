import { LogicError } from "../../../errors/errors";
import { bold } from "../../../helpers/discord";
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
    const rank = this.parsedArguments.rank;

    const { requestable, perspective } = await this.getMentions();

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: 1,
      page: rank,
    });

    const artist = topArtists.artists[0];

    if (!artist)
      throw new LogicError(
        `${perspective.upper.name} haven't scrobbled an artist at that position!`
      );

    await this.oldReply(
      `${bold(artist.name)} is ranked at #**${artist.rank}** in ${
        perspective.possessive
      } top artists with ${bold(displayNumber(artist.userPlaycount, "play"))}`
    );
  }
}
