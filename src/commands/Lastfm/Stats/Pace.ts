import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import {
  generateTimeRange,
  generateHumanTimeRange,
  TimeRange,
} from "../../../helpers/date";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { PaceCalculator } from "../../../lib/calculators/PaceCalculator";
import { LogicError } from "../../../errors";
import { numberDisplay, dateDisplay } from "../../../helpers";

export default class Pace extends LastFMBaseCommand {
  aliases = ["pc"];
  description = "predicts when you're gonna git a milestone";
  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      timeRange: {
        custom: (messageString: string) => generateTimeRange(messageString),
        index: -1,
      },
      humanReadableTimeRange: {
        custom: (messageString: string) =>
          generateHumanTimeRange(messageString, {
            overallMessage: "since <user> began scrobbling",
          }),
        index: -1,
      },
      milestone: { index: 0, regex: /[0-9]{1,}(?!\w)(?! [a-z])/g },
    },
  };

  async run(message: Message) {
    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanReadableTimeRange = this.parsedArguments
        .humanReadableTimeRange as string,
      milestone = (this.parsedArguments.milestone as string).toInt();

    if (milestone > 10000000)
      throw new LogicError(
        "you probably won't be alive to witness that milestone..."
      );

    let { username, perspective } = await this.parseMentionedUsername(message);

    let paceCalculator = new PaceCalculator(this.lastFMService, username);

    let pace = await paceCalculator.calculate(timeRange, milestone);

    let embed = new MessageEmbed().setDescription(
      `At a rate of **${numberDisplay(
        pace.scrobbleRate.toFixed(2),
        "scrobble"
      )}/hour** ${humanReadableTimeRange.replace(
        "<user>",
        perspective.pronoun
      )}, ${perspective.name} will hit **${numberDisplay(
        milestone,
        "** scrobble"
      )} on ${dateDisplay(pace.prediction).bold()}`
    );

    await message.channel.send(embed);
  }
}
