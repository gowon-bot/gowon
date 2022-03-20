import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { humanizePeriod } from "../../../lib/timeAndDate/helpers";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimePeriodArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimePeriodArgument";
import { bold } from "../../../helpers/discord";

const args = {
  timePeriod: new TimePeriodArgument({
    default: "overall",
    description: "The time period to count your albums over",
  }),
  ...standardMentions,
} as const;

export default class AlbumCount extends LastFMBaseCommand<typeof args> {
  idSeed = "cignature semi";
  aliases = ["alc", "lc"];
  description = "Shows you how many albums you've scrobbled";
  subcategory = "library stats";
  usage = ["", "time period @user"];

  slashCommand = true;

  arguments = args;

  async run() {
    const timePeriod = this.parsedArguments.timePeriod;
    const humanizedPeriod = humanizePeriod(timePeriod);

    const { requestable, perspective } = await this.getMentions();

    const albumCount = await this.lastFMService.albumCount(
      this.ctx,
      requestable,
      timePeriod
    );

    await this.oldReply(
      `${perspective.plusToHave} scrobbled ${bold(
        displayNumber(albumCount, "album")
      )} ${humanizedPeriod}`
    );
  }
}
