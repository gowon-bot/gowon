import { bold } from "../../../helpers/discord";
import { calculatePercent } from "../../../helpers/stats";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  ...prefabArguments.track,
} satisfies ArgumentsMap;

export default class TrackPercent extends LastFMBaseCommand<typeof args> {
  idSeed = "itzy yeji";

  aliases = ["tpct"];
  description =
    "Shows you what percentage of an artist's scrobbles are made up by a certain track";
  subcategory = "percents";
  usage = ["artist | track"];

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
      senderRequestable
    );

    const [artistInfo, trackInfo] = await Promise.all([
      this.lastFMService.artistInfo(this.ctx, {
        artist,
        username: requestable,
      }),
      this.lastFMService.trackInfo(this.ctx, {
        artist,
        track,
        username: requestable,
      }),
    ]);

    await this.oldReply(
      `${perspective.possessive} ${displayNumber(
        trackInfo.userPlaycount,
        "play"
      )} of ${bold(trackInfo.name)} represent ${bold(
        calculatePercent(trackInfo.userPlaycount, artistInfo.userPlaycount)
      )}% of ${perspective.possessivePronoun} ${bold(
        artistInfo.name
      )} scrobbles`
    );
  }
}
