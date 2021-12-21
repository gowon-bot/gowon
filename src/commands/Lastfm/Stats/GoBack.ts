import { Arguments } from "../../../lib/arguments/arguments";
import { parseDate } from "../../../lib/timeAndDate/helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError } from "../../../errors";
import { trackEmbed } from "../../../lib/views/embeds";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { GowonService } from "../../../services/GowonService";
import { displayDate } from "../../../lib/views/displays";
import { ago } from "../../../helpers";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TimeRangeParser } from "../../../lib/arguments/custom/TimeRangeParser";

const args = {
  inputs: {
    timeRange: { custom: new TimeRangeParser() },
    date: {
      custom: (string: string) =>
        parseDate(
          string.trim(),
          ...ServiceRegistry.get(GowonService).constants.dateParsers
        ),
    },
  },
  mentions: standardMentions,
} as const;

export default class GoBack extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah sora";

  aliases = ["gb"];
  description = "Shows what you scrobbled in the past...";
  subcategory = "library stats";
  usage = ["time period @user"];

  arguments: Arguments = args;

  validation: Validation = {
    timeRange: {
      validator: new validators.TimeRange({
        requireFrom: true,
        treatOnlyToAsEmpty: true,
      }),
      friendlyName: "time range",
    },
  };

  async run() {
    const timeRange = this.parsedArguments.timeRange!,
      date = this.parsedArguments.date!;

    if (!date && !timeRange.from)
      throw new LogicError("please enter a valid date or time range!");

    const { requestable, perspective } = await this.getMentions({
      asCode: false,
    });

    const track = await this.lastFMService.goBack(
      this.ctx,
      requestable,
      date || timeRange.from!
    );

    if (!track)
      throw new LogicError(
        `${perspective.plusToHave} not scrobbled any tracks in that time period!`
      );

    const embed = this.newEmbed(trackEmbed(track));

    embed.setDescription(
      embed.description +
        (date
          ? `\n\nScrobbled on ${displayDate(date)}`
          : `\n\nScrobbled ${ago(timeRange.from!)}`)
    );

    await this.send(embed);
  }
}
