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

export default class AlbumAt extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan hyeyeon";

  aliases = ["ala"];
  description = "Finds the album in your library at a given rank";
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

    const topAlbums = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: 1,
      page: rank,
    });

    const album = topAlbums.albums[0];

    if (!album)
      throw new LogicError(
        `${perspective.upper.name} haven't scrobbled an album at that position!`
      );

    await this.oldReply(
      `${bold(album.name)} by ${italic(album.artist.name)} is ranked at #**${
        album.rank
      }** in ${perspective.possessive} top albums with ${bold(
        displayNumber(album.userPlaycount, "play")
      )}`
    );
  }
}
