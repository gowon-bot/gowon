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
  ...prefabArguments.track,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class TrackAround extends AroundCommand<typeof args> {
  idSeed = "hello venus alice";

  aliases = ["tra", "tr", "trackrank", "taround", "traround", "ta", "trackat"];
  description = "Shows the other tracks around a track in your top 1000 tracks";
  subcategory = "ranks";
  usage = ["", "artist | track @user", "rank"];

  slashCommand = true;

  arguments = args;

  validation: Validation = {
    rank: new validators.RangeValidator({ min: 1 }),
  };

  async run() {
    const { requestable, senderRequestable, perspective, username } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
      });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable,
      { redirect: true }
    );

    const rank = this.parsedArguments.rank;
    const shouldSearchByRank = rank !== undefined;

    const topArguments = this.getTopArgs(rank, shouldSearchByRank);

    const { tracks } = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: topArguments.limit,
      page: topArguments.page,
    });

    if (!tracks.length) {
      throw new RankTooHighError("track");
    }

    const slicedTracks = this.getSlice({
      entities: tracks,
      entityName: shouldSearchByRank ? undefined : track,
      rank: rank,
      ...topArguments,
    });

    const index = slicedTracks.findIndex(
      (t) =>
        t.name.toLowerCase() === track.toLowerCase() &&
        t.artist.name.toLowerCase() === artist.toLowerCase()
    );

    if ((rank || index) === -1) {
      throw new NotFoundInTopError(
        "track",
        perspective.possessive,
        tracks.length
      );
    }

    const embed = this.authorEmbed()
      .setHeader("Track around")
      .setTitle(
        `Tracks around ${
          shouldSearchByRank
            ? `rank ${displayNumber(rank)}`
            : slicedTracks[index].name
        } in ${perspective.possessive} library`
      )
      .setURL(LastfmLinks.libraryAroundTrack(username, slicedTracks[0].rank))
      .setDescription(
        displayNumberedList(
          slicedTracks.map((val) => {
            const display = `${italic(val.name)} by ${sanitizeForDiscord(
              val.artist.name
            )} - ${displayNumber(val.userPlaycount, "play")}`;

            return val.rank === (rank || index + 1) ||
              (val.name.toLowerCase() === track.toLowerCase() &&
                val.artist.name.toLowerCase() === artist.toLowerCase())
              ? bold(display, false)
              : display;
          }),
          slicedTracks[0].rank - 1
        )
      );

    await this.send(embed);
  }
}
