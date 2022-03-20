import { calculatePercent } from "../../../helpers/stats";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { bold } from "../../../helpers/discord";

const args = {
  ...prefabArguments.artist,
  ...standardMentions,
} as const;

export default class ArtistPercent extends LastFMBaseCommand<typeof args> {
  idSeed = "twice tzuyu";

  aliases = ["apct"];
  description =
    "Shows you what percentage of your total scrobbles are made up by a certain artist";
  subcategory = "percents";
  usage = ["", "artist"];

  slashCommand = true;

  arguments = args;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
      });

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const [artistInfo, userInfo] = await Promise.all([
      this.lastFMService.artistInfo(this.ctx, {
        artist,
        username: requestable,
      }),
      this.lastFMService.userInfo(this.ctx, { username: requestable }),
    ]);

    await this.oldReply(
      `${perspective.possessive} ${displayNumber(
        artistInfo.userPlaycount,
        "play"
      )} of ${bold(artistInfo.name)} represent ${bold(
        calculatePercent(artistInfo.userPlaycount, userInfo.scrobbleCount)
      )}% of ${perspective.possessivePronoun} total scrobbles`
    );
  }
}
