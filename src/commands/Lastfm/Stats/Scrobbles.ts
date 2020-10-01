import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import {
  TimeRange,
  timeRangeParser,
  humanizedTimeRangeParser,
} from "../../../helpers/date";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Scrobbles extends LastFMBaseCommand {
  aliases = ["s"];
  description = "Shows you how many scrobbles you have";
  subcategory = "library stats";
  usage = ["time period @user"];

  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      timeRange: { custom: timeRangeParser(), index: -1 },
      humanizedTimeRange: { custom: humanizedTimeRangeParser(), index: -1 },
    },
  };

  async run(message: Message) {
    if (
      message.content.trim() ===
      `${this.gowonService.prefix(this.guild.id)}s n s d`
    ) {
      await this.send("Gee gee gee gee baby baby baby");
      return;
    }

    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanTimeRange = this.parsedArguments.humanizedTimeRange as string;

    let { username, perspective } = await this.parseMentionedUsername();

    let scrobbles = await this.lastFMService.getNumberScrobbles(
      username,
      timeRange.from,
      timeRange.to
    );

    let sentMessage = await this.reply(
      `${perspective.plusToHave} ${numberDisplay(
        scrobbles,
        "scrobble"
      ).bold()} ${humanTimeRange}`
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
