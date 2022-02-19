import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { LogicError } from "../../../errors";
import { toInt } from "../../../helpers/lastFM";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  ...prefabArguments.track,
} as const;

export default class TrackRank extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature seline";

  aliases = ["tra", "tr"];
  description = "Shows what rank a track is at in your top 1000 tracks";
  subcategory = "ranks";
  usage = ["", "artist | track @user"];

  arguments = args;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.parseMentions({
        senderRequired:
          !this.parsedArguments.track || !this.parsedArguments.artist,
      });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable,
      true
    );

    let topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    let rank = topTracks.tracks.findIndex(
      (a) =>
        a.name.toLowerCase() === track!.toLowerCase() &&
        a.artist.name.toLowerCase() === artist!.toLowerCase()
    );

    if (rank === -1) {
      const isNumber = !isNaN(toInt(this.parsedArguments.artist));

      throw new LogicError(
        `That track wasn't found in ${
          perspective.possessive
        } top ${displayNumber(topTracks.tracks.length, "track")}`,
        isNumber
          ? `Looking to find the artist at rank ${this.parsedArguments.artist}? Run ${this.prefix}aa ${this.parsedArguments.artist}`
          : ""
      );
    } else {
      await this.traditionalReply(
        `${topTracks.tracks[rank].name.strong()} by ${
          topTracks.tracks[rank].artist.name
        } is ranked #${displayNumber(rank + 1).strong()} with ${displayNumber(
          topTracks.tracks[rank].userPlaycount,
          "play"
        ).strong()}`
      );
    }
  }
}
