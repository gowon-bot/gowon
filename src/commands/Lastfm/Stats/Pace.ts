import { MessageEmbed } from "discord.js";
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
import moment from "moment";

export default class Pace extends LastFMBaseCommand {
  aliases = ["pc"];
  description = "predicts when you're gonna git a milestone";
  subcategory = "library stats";
  usage = ["", "milestone", "time period milestone @user"];

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
        custom: (messageString: string) =>
          generateTimeRange(messageString, {
            useOverall: true,
            fallback: "1 week",
          }),
        index: -1,
      },
      humanReadableTimeRange: {
        custom: (messageString: string) =>
          generateHumanTimeRange(messageString, {
            overallMessage: "since <user> began scrobbling",
            fallback: "week",
          }),
        index: -1,
      },
      milestone: {
        index: 0,
        regex: /[0-9]{1,}(?!\w)(?! [a-z])/g,
        number: true,
      },
    },
  };

  async run() {
    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanReadableTimeRange = this.parsedArguments
        .humanReadableTimeRange as string,
      milestone = this.parsedArguments.milestone as number | undefined;

    if (milestone && milestone > 10000000)
      throw new LogicError(
        "you probably won't be alive to witness that milestone..."
      );

    let { username, perspective } = await this.parseMentionedUsername();

    let paceCalculator = new PaceCalculator(this.lastFMService, username);

    let pace = await paceCalculator.calculate(timeRange, milestone);

    if (moment(pace.prediction).isBefore(new Date()))
      throw new LogicError(
        `${perspective.plusToHave} already passed that milestone!`
      );

    let embed = new MessageEmbed().setDescription(
      `At a rate of **${numberDisplay(
        pace.scrobbleRate.toFixed(2),
        "scrobble"
      )}/hour** ${humanReadableTimeRange.replace(
        "<user>",
        perspective.pronoun
      )}, ${perspective.name} will hit **${numberDisplay(
        pace.milestone,
        "** scrobble"
      )} on ${dateDisplay(pace.prediction).bold()}`
    );

    await this.send(embed);
  }
}
