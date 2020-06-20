import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import {
  generateTimeRange,
  TimeRange,
  generateHumanTimeRange,
} from "../../../helpers/date";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Scrobbles extends LastFMBaseCommand {
  aliases = ["s"];
  description = "Shows you how many scrobbles you have";
  arguments: Arguments = {
    mentions: {
      user: { index: 0, description: "The user to lookup" },
    },
    inputs: {
      timeRange: {
        custom: (messageString: string) => generateTimeRange(messageString),
        index: -1,
      },
      humanReadableTimeRange: {
        custom: (messageString: string) =>
          generateHumanTimeRange(messageString),
        index: -1,
      },
    },
  };

  async run(message: Message) {
    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanTimeRange = this.parsedArguments.humanReadableTimeRange as string;

    let { username, perspective } = await this.parseMentionedUsername(message);

    let scrobbles = await this.lastFMService.getNumberScrobbles(
      username,
      timeRange.from,
      timeRange.to
    );

    await message.reply(
      `${perspective.plusToHave} **${numberDisplay(
        scrobbles,
        "scrobble"
      )}** ${humanTimeRange}`
    );
  }
}
