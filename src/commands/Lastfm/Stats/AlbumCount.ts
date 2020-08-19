import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { generatePeriod, generateHumanPeriod } from "../../../helpers/date";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LastFMPeriod } from "../../../services/LastFMService.types";

export default class AlbumCount extends LastFMBaseCommand {
  aliases = ["alc", "lc"];
  description = "Shows you how many albums you've scrobbled";
  subcategory = "library stats";
  usage = ["", "time period @user"];

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
    let timePeriod = this.parsedArguments.timePeriod as LastFMPeriod,
      humanReadableTimePeriod = this.parsedArguments
        .humanReadableTimePeriod as string;

    let { username, perspective } = await this.parseMentionedUsername(message);

    let scrobbles = await this.lastFMService.albumCount(username, timePeriod);

    await message.reply(
      `${perspective.plusToHave} scrobbled ${numberDisplay(
        scrobbles,
        "album"
      ).bold()} ${humanReadableTimePeriod}`
    );
  }
}
