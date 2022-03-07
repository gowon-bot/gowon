import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors/errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  rank: new NumberArgument({
    description: "The rank to lookup",
    required: true,
  }),
  ...standardMentions,
} as const;

export default class AlbumAt extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan hyeyeon";

  aliases = ["ala"];
  description = "Finds the album in your library at a given rank";
  subcategory = "ranks";
  usage = ["", "rank @user"];

  arguments = args;
  slashCommand = true;

  validation: Validation = {
    rank: new validators.Number({ whole: true }),
  };

  async run() {
    let rank = this.parsedArguments.rank;

    let { requestable, perspective } = await this.getMentions();

    let topAlbums = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
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
