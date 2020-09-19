import { Arguments } from "../../../lib/arguments/arguments";
import {
  generateTimeRange,
  TimeRange,
  generateHumanTimeRange,
} from "../../../helpers/date";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { TrackEmbed } from "../../../helpers/Embeds";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

export default class GoBack extends LastFMBaseCommand {
  aliases = ["gb"];
  description = "Shows what you scrobbled in the past";
  subcategory = "library stats";
  usage = ["time period @user"];

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
          generateHumanTimeRange(messageString, { raw: true, noOverall: true }),
        index: -1,
      },
    },
  };

  validation: Validation = {
    timeRange: { validator: new validators.TimeRange({ requireFrom: true }) },
  };

  async run() {
    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanTimeRange = this.parsedArguments.humanReadableTimeRange as string;

    let { username, perspective } = await this.parseMentionedUsername({
      asCode: false,
    });

    let track = await this.lastFMService.goBack(username, timeRange.from!);

    if (!track)
      throw new LogicError(
        `${perspective.plusToHave} not scrobbled any tracks in that time period!`
      );

    let embed = TrackEmbed(track).setAuthor(
      `${humanTimeRange} ago ${perspective.name} scrobbled:`
    );

    await this.send(embed);
  }
}
