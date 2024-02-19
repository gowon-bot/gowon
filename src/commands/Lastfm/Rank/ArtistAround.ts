import { NotFoundInTopError, RankTooHighError } from "../../../errors/errors";
import { asyncMap } from "../../../helpers";
import { bold } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { RedirectsCache } from "../../../lib/caches/RedirectsCache";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber, displayNumberedList } from "../../../lib/ui/displays";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { AroundCommand } from "./AroundCommand";

const args = {
  rank: new NumberArgument({ description: "The rank to look up" }),
  ...prefabArguments.artist,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class ArtistAround extends AroundCommand<typeof args> {
  idSeed = "hot issue dain";

  aliases = ["ar", "ra", "artistrank", "around", "aar", "artistat", "aa"];
  description =
    "Shows the other artists around an artist in your top 1000 artists";
  subcategory = "ranks";
  usage = ["artist @user", "rank"];

  arguments = args;

  validation: Validation = {
    rank: new validators.RangeValidator({ min: 1 }),
  };

  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    const redirectsCache = new RedirectsCache(this.ctx);

    const { requestable, senderRequestable, perspective, username } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: true }
    );

    const rank = this.parsedArguments.rank;
    const shouldSearchByRank = rank !== undefined;

    const topArguments = this.getTopArgs(
      this.parsedArguments.rank,
      shouldSearchByRank
    );

    const { artists } = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: topArguments.limit,
      page: topArguments.page,
    });

    if (!artists.length) {
      throw new RankTooHighError("artist");
    }

    const slicedArtists = this.getSlice({
      entities: artists,
      entityName: shouldSearchByRank ? undefined : artistName,
      rank: rank!,
      ...topArguments,
    });

    await redirectsCache.initialCache(
      this.ctx,
      slicedArtists.map((a) => a.name)
    );

    const index = (
      await asyncMap(
        slicedArtists,
        async (a) => await redirectsCache.getRedirect(a.name)
      )
    ).findIndex((a) => a.toLowerCase() === artistName.toLowerCase());

    if ((rank || index) === -1) {
      throw new NotFoundInTopError(
        "artist",
        perspective.possessive,
        artists.length
      );
    }

    const embed = this.minimalEmbed()
      .setTitle(
        `Artists around ${
          shouldSearchByRank
            ? `rank ${displayNumber(rank)}`
            : slicedArtists[index].name
        } in ${perspective.possessive} library`
      )
      .setURL(LastfmLinks.libraryAroundArtist(username, slicedArtists[0].rank))
      .setDescription(
        displayNumberedList(
          slicedArtists.map((val) => {
            const display = `${val.name} - ${displayNumber(
              val.userPlaycount,
              "play"
            )}`;

            return val.rank === (rank || index + 1) ||
              val.name.toLowerCase() === artistName.toLowerCase()
              ? bold(display)
              : display;
          }),
          slicedArtists[0].rank - 1
        )
      );

    await this.reply(embed);
  }
}
