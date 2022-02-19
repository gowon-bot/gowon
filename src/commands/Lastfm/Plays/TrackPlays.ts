import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...standardMentions,
  ...prefabArguments.track,
} as const;

export default class TrackPlays extends LastFMBaseCommand<typeof args> {
  idSeed = "gugudan hana";

  aliases = ["tp"];
  description = "Shows you how many plays you have of a given track";
  subcategory = "plays";
  usage = ["artist | track @user"];

  arguments = args;

  async run() {
    let { requestable, senderRequestable, perspective } =
      await this.parseMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
      });

    let { artist, track } = await this.lastFMArguments.getTrack(
      this.ctx,
      senderRequestable
    );

    const hamham =
      artist.toLowerCase() === "iu" && track.toLowerCase() === "ham ham";
    if (hamham) track = "Jam Jam";

    const trackDetails = await this.lastFMService.trackInfo(this.ctx, {
      artist,
      track,
      username: requestable,
    });

    await this.traditionalReply(
      `${hamham ? "FTFY\n" : ""}${perspective.plusToHave}` +
        (trackDetails.userPlaycount === 0
          ? "n't scrobbled"
          : ` **${displayNumber(
              trackDetails.userPlaycount,
              "**scrobble"
            )} of`) +
        ` **${trackDetails.name}** by ${trackDetails.artist.name}`
    );
  }
}
