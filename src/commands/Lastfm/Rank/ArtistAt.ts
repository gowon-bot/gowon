import { Arguments } from "../../../lib/arguments/arguments";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { validators } from "../../../lib/validation/validators";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class ArtistAt extends LastFMBaseCommand {
  aliases = ["aa"];
  description = "Finds the artist in your library at a given rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  arguments: Arguments = {
    inputs: {
      rank: { index: 0, default: 1, number: true },
    },
    mentions: standardMentions,
  };

  validation: Validation = {
    rank: new validators.Number({ whole: true }),
  };

  async run() {
    let rank = this.parsedArguments.rank as number;

    let { username, perspective } = await this.parseMentions();

    let topArtists = await this.lastFMService.topArtists({
      username,
      limit: 1,
      page: rank,
    });

    let artist = topArtists.artist[0];

    if (!artist)
      throw new LogicError(
        `${perspective.upper.name} haven't scrobbled an artist at that position!`
      );

    await this.reply(
      `${artist.name.bold()} is ranked at #${artist["@attr"].rank.bold()} in ${
        perspective.possessive
      } top artists with ${numberDisplay(artist.playcount, "play").bold()}`
    );
  }
}
