import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import {
  TimeRange,
  timeRangeParser,
  humanizedTimeRangeParser,
  parseDate,
} from "../../../helpers/date";
import { dateDisplay, numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class Scrobbles extends LastFMBaseCommand {
  aliases = ["s"];
  description = "Shows you how many scrobbles you have";
  subcategory = "library stats";
  usage = ["time period @user"];

  arguments: Arguments = {
    inputs: {
      timeRange: { custom: timeRangeParser(), index: -1 },
      humanizedTimeRange: { custom: humanizedTimeRangeParser(), index: -1 },
      date: {
        custom: (string: string) =>
          parseDate(string.trim(), ...this.gowonService.constants.dateParsers),
        index: -1,
      },
    },
    mentions: standardMentions,
  };

  async run(message: Message) {
    if (
      message.content.trim() ===
      `${await this.gowonService.prefix(this.guild.id)}s n s d`
    ) {
      await this.send("Gee gee gee gee baby baby baby");
      return;
    }

    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanTimeRange = this.parsedArguments.humanizedTimeRange as string,
      date = this.parsedArguments.date as Date | undefined;

    let { username, perspective } = await this.parseMentions();

    let scrobbles = await this.lastFMService.getNumberScrobbles(
      username,
      date || timeRange.from,
      date ? new Date() : timeRange.to
    );

    let sentMessage = await this.reply(
      `${perspective.plusToHave} ${numberDisplay(
        scrobbles,
        "scrobble"
      ).bold()} ${date ? `since ${dateDisplay(date)}` : humanTimeRange}`
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
