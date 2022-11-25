import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { displayDate, displayNumber } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { TimeRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/TimeRangeArgument";
import { DateArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/DateArgument";
import { TimeRange } from "../../../lib/timeAndDate/TimeRange";
import { bold } from "../../../helpers/discord";
import { ArgumentsMap } from "../../../lib/context/arguments/types";

const args = {
  ...standardMentions,
  date: new DateArgument(),
  timeRange: new TimeRangeArgument({
    useOverall: true,
    default: () => TimeRange.overall(),
  }),
} satisfies ArgumentsMap

export default class Scrobbles extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah songyee";

  aliases = ["s", "scrabbles"];
  description =
    "Shows you how many scrobbles you have over a given time period";
  subcategory = "library stats";
  usage = ["time period @user"];

  arguments = args;

  async run() {
    if (
      this.payload.isMessage() &&
      this.payload.source.content.trim() === `${this.prefix}s n s d`
    ) {
      await this.send("Gee gee gee gee baby baby baby");
      return;
    }

    const timeRange = this.parsedArguments.timeRange,
      date = this.parsedArguments.date;

    const { requestable, perspective } = await this.getMentions();

    const scrobbles = await this.lastFMService.getNumberScrobbles(
      this.ctx,
      requestable,
      date || timeRange.from,
      date ? undefined : timeRange.to
    );

    const sentMessage = await this.oldReply(
      `${perspective.plusToHave} ${bold(
        displayNumber(
          scrobbles,
          `scr${this.extract.didMatch("scrabbles") ? "a" : "o"}bble`
        )
      )} ${date ? `since ${displayDate(date)}` : timeRange.humanized}`
    );

    if (timeRange.isOverall && scrobbles % 25000 === 0 && scrobbles > 0) {
      await sentMessage.react("🥳");
    }
  }
}
