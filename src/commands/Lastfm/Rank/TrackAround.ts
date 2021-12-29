import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { LogicError } from "../../../errors";
import { sanitizeForDiscord } from "../../../helpers/discord";

const args = {
  inputs: {
    artist: {
      index: 0,
      splitOn: "|",
    },
    track: {
      index: 1,
      splitOn: "|",
    },
  },
  mentions: standardMentions,
} as const;

export default class TrackAround extends LastFMBaseCommand<typeof args> {
  idSeed = "hello venus alice";

  aliases = ["taround", "traround", "tar", "trar"];
  description = "Shows the ranks around a track in your top 1000 tracks";
  subcategory = "ranks";
  usage = ["", "artist | track @user"];

  arguments: Arguments = args;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.parseMentions({
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
            const display = `${val.name.italic()} by ${sanitizeForDiscord(
              val.artist.name
            )} - ${displayNumber(val.userPlaycount, "play")}`;

            return start + idx === rank ? display.strong(false) : display;
          }),
          start
        )
      );

    await this.send(embed);
  }
}
