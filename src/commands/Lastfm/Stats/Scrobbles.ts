import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import {
  timeRangeParser,
  humanizedTimeRangeParser,
  parseDate,
} from "../../../helpers/date";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { GowonService } from "../../../services/GowonService";
import { displayDate, displayNumber } from "../../../lib/views/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

const args = {
  inputs: {
    timeRange: { custom: timeRangeParser(), index: -1 },
    humanizedTimeRange: { custom: humanizedTimeRangeParser(), index: -1 },
    date: {
      custom: (string: string) =>
        parseDate(
          string.trim(),
          ...ServiceRegistry.get(GowonService).constants.dateParsers
        ),
      index: -1,
    },
  },
  mentions: standardMentions,
} as const;

export default class Scrobbles extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah songyee";

  aliases = ["s", "scrabbles"];
  description =
    "Shows you how many scrobbles you have over a given time period";
  subcategory = "library stats";
  usage = ["time period @user"];

  arguments: Arguments = args;

  async run(message: Message) {
    if (message.content.trim() === `${this.prefix}s n s d`) {
      await this.send("Gee gee gee gee baby baby baby");
      return;
    }

    let timeRange = this.parsedArguments.timeRange!,
      humanTimeRange = this.parsedArguments.humanizedTimeRange!,
      date = this.parsedArguments.date;

    let { requestable, perspective } = await this.parseMentions();

    let scrobbles = await this.lastFMService.getNumberScrobbles(
      this.ctx,
      requestable,
      date || timeRange.from,
      date ? new Date() : timeRange.to
    );

    let sentMessage = await this.traditionalReply(
      `${perspective.plusToHave} ${displayNumber(
        scrobbles,
        `scr${this.runAs.variationWasUsed("scrabbles") ? "a" : "o"}bble`
      ).strong()} ${date ? `since ${displayDate(date)}` : humanTimeRange}`
    );

    if (
      humanTimeRange === "overall" &&
      scrobbles % 25000 === 0 &&
      scrobbles > 0
    ) {
      await sentMessage.react("🥳");
    }
  }
}
