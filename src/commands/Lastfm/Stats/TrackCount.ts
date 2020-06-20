import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { generatePeriod, generateHumanPeriod } from "../../../helpers/date";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TrackCount extends LastFMBaseCommand {
  aliases = ["tc"];
  description = "Shows you how many tracks you've scrobbled";
  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      timePeriod: {
        custom: (messageString: string) => generatePeriod(messageString),
        index: -1,
      },
      humanReadableTimePeriod: {
        custom: (messageString: string) => generateHumanPeriod(messageString),
        index: -1,
      },
    },
  };

  async run(message: Message) {
    let timePeriod = this.parsedArguments.timePeriod as string,
      humanReadableTimePeriod = this.parsedArguments
        .humanReadableTimePeriod as string;

    let { username, perspective } = await this.parseMentionedUsername(message);

    let scrobbles = await this.lastFMService.trackCount(username, timePeriod);

    await message.reply(
      `${perspective.plusToHave} scrobbled **${numberDisplay(
        scrobbles,
        "track"
      )}** ${humanReadableTimePeriod}`
    );
  }
}
