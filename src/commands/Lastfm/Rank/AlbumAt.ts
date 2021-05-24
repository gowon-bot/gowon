import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    rank: { index: 0, default: 1, number: true },
  },
  mentions: standardMentions,
} as const;

export default class AlbumAt extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan hyeyeon";

  aliases = ["ala"];
  description = "Finds the album in your library at a given rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  arguments: Arguments = args;

  validation: Validation = {
    rank: new validators.Number({ whole: true }),
  };

  async run() {
    let rank = this.parsedArguments.rank;

    let { username, perspective } = await this.parseMentions();

    let topAlbums = await this.lastFMService.topAlbums({
      username,
      limit: 1,
      page: rank,
    });

    let album = topAlbums.albums[0];

    if (!album)
      throw new LogicError(
        `${perspective.upper.name} haven't scrobbled an album at that position!`
      );

    await this.traditionalReply(
      `${album.name.strong()} by ${album.artist.name.italic()} is ranked at #**${
        album.rank
      }** in ${perspective.possessive} top albums with ${displayNumber(
        album.userPlaycount,
        "play"
      ).strong()}`
    );
  }
}
