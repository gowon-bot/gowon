import { LogicError } from "../../../errors/errors";
import { bold, italic, sanitizeForDiscord } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { TopArtist } from "../../../services/LastFM/converters/TopTypes";
import { RankCommand } from "./RankCommand";

const args = {
  rank: new NumberArgument({ description: "The rank to look up" }),
  ...prefabArguments.album,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class AlbumRank extends RankCommand<typeof args> {
  idSeed = "wonder girls sunmi";

  aliases = ["lr", "alr", "albumaround", "laround", "alaround"];
  description =
    "Shows the other albums around an album in your top 1000 albums";
  subcategory = "ranks";
  usage = ["", "artist | album @user"];

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
    let { albums } = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: topArguments.limit,
      page: topArguments.page,
    });

    const originalAlbumCount = albums.length;

    if (albums.length === 0)
      throw new LogicError("You haven't scrobbled that many albums!");

    albums = this.getSlice({
      entities: albums,
      entityName: shouldSearchByRank ? undefined : album,
      rank: rank,
      ...topArguments,
    });

    const index = albums.findIndex(
      (a) =>
        a.name.toLowerCase() === album.toLowerCase() &&
        a.artist.name.toLowerCase() === artist.toLowerCase()
    );

    if ((rank || index) === -1) {
      throw new LogicError(
        `That album wasn't found in ${
          perspective.possessive
        } top ${displayNumber(originalAlbumCount, "album")}`
      );
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Album around"))
      .setTitle(
        `Albums around ${
          shouldSearchByRank
            ? `rank ${displayNumber(rank)}`
            : albums[index].name
        } in ${perspective.possessive} library`
      )
      .setURL(LastfmLinks.libraryAroundAlbum(username, albums[0].rank))
      .setDescription(
        displayNumberedList(
          albums.map((val) => {
            const display = `${italic(val.name)} by ${sanitizeForDiscord(
              val instanceof TopArtist ? val.name : val.artist.name
            )} - ${displayNumber(val.userPlaycount, "play")}`;

            return val.rank === (rank || index + 1) ||
              (val.name.toLowerCase() === album.toLowerCase() &&
                val.artist.name.toLowerCase() === artist.toLowerCase())
              ? bold(display, false)
              : display;
          }),
          albums[0].rank - 1
        )
      );

    await this.send(embed);
  }
}
