import { LastFMBaseCommand } from "../LastFMBaseCommand";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { LogicError } from "../../../errors/errors";
import { bold, italic, sanitizeForDiscord } from "../../../helpers/discord";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...prefabArguments.track,
  ...standardMentions,
} as const;

export default class TrackRank extends LastFMBaseCommand<typeof args> {
  idSeed = "hello venus alice";

  aliases = ["tra", "tr", "trackaround", "taround", "traround"];
  description = "Shows the other tracks around a track in your top 1000 tracks";
  subcategory = "ranks";
  usage = ["", "artist | track @user"];

  slashCommand = true;

  arguments = args;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
      });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable,
      true
    );

    const topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: 1000,
    });

    const rank = topTracks.tracks.findIndex(
      (t) =>
        t.name.toLowerCase() === track!.toLowerCase() &&
        t.artist.name.toLowerCase() === artist!.toLowerCase()
    );

    if (rank === -1) {
      throw new LogicError(
        `That track wasn't found in ${
          perspective.possessive
        } top ${displayNumber(topTracks.tracks.length, "track")}`
      );
    }

    const start = rank < 5 ? 0 : rank - 5;
    const stop =
      rank > topTracks.tracks.length - 6
        ? topTracks.tracks.length - 1
        : rank + 6;

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Track around"))
      .setTitle(
        `Tracks around ${topTracks.tracks[rank].name} in ${perspective.possessive} library`
      )
      .setDescription(
        displayNumberedList(
          topTracks.tracks.slice(start, stop).map((val, idx) => {
            const display = `${italic(val.name)} by ${sanitizeForDiscord(
              val.artist.name
            )} - ${displayNumber(val.userPlaycount, "play")}`;

            return start + idx === rank ? bold(display, false) : display;
          }),
          start
        )
      );

    await this.send(embed);
  }
}
