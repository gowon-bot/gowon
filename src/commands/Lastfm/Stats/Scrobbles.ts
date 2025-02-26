import { bold } from "../../../helpers/discord";
import { DateArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/DateArgument";
import { DateRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/DateRangeArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { DateRange } from "../../../lib/timeAndDate/DateRange";
import { displayDate, displayNumber } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  date: new DateArgument(),
  dateRange: new DateRangeArgument({
    useOverall: true,
    default: () => DateRange.overall(),
  }),
} satisfies ArgumentsMap;

export default class Scrobbles extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah songyee";

  aliases = ["s", "scrabbles", "scromples", "scroibles"];
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
      await this.reply("Gee gee gee gee baby baby baby");
      return;
    }

    const dateRange = this.parsedArguments.dateRange,
      date = this.parsedArguments.date;

    const { requestable, perspective } = await this.getMentions();

    const scrobbles = await this.lastFMService.getNumberScrobbles(
      this.ctx,
      requestable,
      date || dateRange.from,
      date ? undefined : dateRange.to
    );

    const embed = this.minimalEmbed().setDescription(
      `${perspective.upper.plusToHave} ${bold(
        displayNumber(
          scrobbles,
          this.extract.didMatch("scrabbles")
            ? "scrabble"
            : this.extract.didMatch("scromples")
            ? "scromple"
            : this.extract.didMatch("scroibles")
            ? "scroible"
            : "scrobble"
        )
      )} ${date ? `since ${displayDate(date)}` : dateRange.humanized()}`
    );

    if (dateRange.isOverall && scrobbles % 25000 === 0 && scrobbles > 0) {
      embed.setReacts(["🥳"]);
    }

    await this.reply(embed);
  }
}
