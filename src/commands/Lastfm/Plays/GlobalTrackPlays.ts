import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { calculatePercent } from "../../../helpers/stats";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    track: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class GlobalTrackPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan mimi";

  aliases = ["gtp", "globaltp"];
  description =
    "Shows you how many plays Last.fm has of a given tracks for all users";
  subcategory = "plays";
  usage = ["artist | track"];

  arguments: Arguments = args;

  async run() {
    let { requestable, perspective, senderRequestable } =
      await this.parseMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
      });

    const { artist, track } = await this.lastFMArguments.getTrack(
      senderRequestable
    );

    const trackDetails = await this.lastFMService.trackInfo({
      artist,
      track,
      username: requestable,
    });

    const percentage = calculatePercent(
      trackDetails.userPlaycount,
      trackDetails.globalPlaycount
    );

    await this.send(
      `Last.fm has scrobbled **${trackDetails.name}** by ${
        trackDetails.artist.name
      } ${displayNumber(trackDetails.globalPlaycount, "time")}${
        toInt(trackDetails.userPlaycount) > 0
          ? `. ${perspective.upper.plusToHave} ${displayNumber(
              trackDetails.userPlaycount,
              "scrobble"
            )}${parseFloat(percentage) > 0 ? ` (${percentage}%)` : ""}`
          : ""
      }`
    );
  }
}
