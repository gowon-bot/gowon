import { NotFoundInTopError, RankTooHighError } from "../../../errors/errors";
import { bold, italic, sanitizeForDiscord } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber, displayNumberedList } from "../../../lib/ui/displays";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { AroundCommand } from "./AroundCommand";

const args = {
  rank: new NumberArgument({ description: "The rank to look up" }),
  ...prefabArguments.album,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class AlbumAround extends AroundCommand<typeof args> {
  idSeed = "wonder girls sunmi";

  aliases = ["lr", "alr", "albumrank", "laround", "alaround", "ala", "albumat"];
  description =
    "Shows the other albums around an album in your top 1000 albums";
  subcategory = "ranks";
  usage = ["", "artist | album @user", "rank"];

  arguments = args;

  validation: Validation = {
    rank: new validators.RangeValidator({ min: 1 }),
  };

  slashCommand = true;

  async run() {
    const { requestable, senderRequestable, perspective, username } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable,
      { redirect: true }
    );

    const rank = this.parsedArguments.rank;
    const shouldSearchByRank = typeof rank === "number";

    const topArguments = this.getTopArgs(rank, shouldSearchByRank);

    const { albums } = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: topArguments.limit,
      page: topArguments.page,
    });

    if (!albums.length) {
      throw new RankTooHighError("album");
    }

    const slicedAlbums = this.getSlice({
      entities: albums,
      entityName: shouldSearchByRank ? undefined : album,
      rank: rank,
      ...topArguments,
    });

    const index = slicedAlbums.findIndex(
      (a) =>
        a.name.toLowerCase() === album.toLowerCase() &&
        a.artist.name.toLowerCase() === artist.toLowerCase()
    );

    if ((rank || index) === -1) {
      throw new NotFoundInTopError(
        "album",
        perspective.possessive,
        albums.length
      );
    }

    const embed = this.minimalEmbed()
      .setTitle(
        `Albums around ${
          shouldSearchByRank
            ? `rank ${displayNumber(rank)}`
            : slicedAlbums[index].name
        } in ${perspective.possessive} library`
      )
      .setURL(LastfmLinks.libraryAroundAlbum(username, slicedAlbums[0].rank))
      .setDescription(
        displayNumberedList(
          slicedAlbums.map((val) => {
            const display = `${italic(val.name)} by ${sanitizeForDiscord(
              val.artist.name
            )} - ${displayNumber(val.userPlaycount, "play")}`;

            return val.rank === (rank || index + 1) ||
              (val.name.toLowerCase() === album.toLowerCase() &&
                val.artist.name.toLowerCase() === artist.toLowerCase())
              ? bold(display, false)
              : display;
          }),
          slicedAlbums[0].rank - 1
        )
      );

    await this.reply(embed);
  }
}
