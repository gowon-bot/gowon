import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { validators } from "../../../lib/validation/validators";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    rank: { index: 0, default: 1, number: true },
  },
  mentions: standardMentions,
} as const;

export default class ArtistAt extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature jeewon";

  aliases = ["aa"];
  description = "Finds the artist in your library at a given rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  arguments: Arguments = args;

  validation: Validation = {
    rank: new validators.Number({ whole: true }),
  };

  async run() {
    let rank = this.parsedArguments.rank!;

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

    await this.traditionalReply(
      `${artist.name.strong()} is ranked at #**${artist.rank}** in ${
        perspective.possessive
      } top artists with ${displayNumber(
        artist.userPlaycount,
        "play"
      ).strong()}`
    );
  }
}
