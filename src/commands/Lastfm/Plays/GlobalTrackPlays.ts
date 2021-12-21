import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { calculatePercent } from "../../../helpers/stats";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  ...prefabArguments.track,
} as const;

export default class GlobalTrackPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan mimi";

  aliases = ["gtp", "globaltp"];
  description =
    "Shows you how many plays Last.fm has of a given tracks for all users";
  subcategory = "plays";
  usage = ["artist | track"];

  arguments = args;

  async run() {
    let { requestable, perspective, senderRequestable } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
      });

    const { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable
    );

    const trackDetails = await this.lastFMService.trackInfo(this.ctx, {
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
