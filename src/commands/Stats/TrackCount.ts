import { BaseCommand } from "../../BaseCommand";
import { Message } from "discord.js";
import { Arguments } from "../../arguments";
import { generatePeriod, generateHumanPeriod } from "../../helpers/date";
import { numberDisplay } from "../../helpers";

export default class TrackCount extends BaseCommand {
  aliases = ["tc"];
  description = "Shows you how many tracks you've scrobbled";
  arguments: Arguments = {
    mentions: {
      0: { name: "user", description: "The user to look up" },
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
        scrobbles, "track"
      )}** ${humanReadableTimePeriod}`
    );
  }
}
