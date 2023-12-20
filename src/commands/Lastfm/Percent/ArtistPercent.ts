import { bold } from "../../../helpers/discord";
import { calculatePercent } from "../../../helpers/stats";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...prefabArguments.artist,
  ...standardMentions,
} satisfies ArgumentsMap;

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
