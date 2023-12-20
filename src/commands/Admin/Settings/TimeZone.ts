import { format } from "date-fns";
import { InvalidTimeZoneError } from "../../../errors/timesAndDates";
import { code } from "../../../helpers/discord";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { TimeZone as TimeZoneType } from "../../../lib/timeAndDate/TimeZone";
import { displayLink } from "../../../lib/ui/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TimeAndDateService } from "../../../services/TimeAndDateService";
import { SettingsChildCommand } from "./SettingsChildCommand";

const args = {
  timeZone: new StringArgument({
    index: { start: 0 },
    description: "What timezone you want to set",
  }),
} satisfies ArgumentsMap;

export default class TimeZone extends SettingsChildCommand<typeof args> {
  idSeed = "le sserafim chaewon";

  private readonly timeZoneListLink =
    "https://en.wikipedia.org/wiki/List_of_tz_database_time_zones";

  description = "Set what time zone you're in for commands that use dates";
  extraDescription = `.\nSee a list of timezones ${displayLink(
    "here",
    this.timeZoneListLink
  )}`;

  aliases = ["tz", "settz", "settimezone"];
  usage = ["", "Continent/City"];

  arguments = args;

  slashCommand = true;

  timeAndDateService = ServiceRegistry.get(TimeAndDateService);

  async run() {
    const timeZoneString = this.parsedArguments.timeZone
      ?.toLowerCase()
      ?.replace(/\s+/, "_");

    const embed = this.authorEmbed().setHeader("Time zone");

    if (timeZoneString) {
      if (!TimeZoneType.isValidString(timeZoneString)) {
        throw new InvalidTimeZoneError(this.prefix);
      }

      const timeZone = TimeZoneType.fromString(timeZoneString)!;

      await this.timeAndDateService.setUserTimeZone(
        this.ctx,
        this.author.id,
        timeZone
      );

      embed.setDescription(
        `Your new timezone is: ${code(
          timeZone.asString()
        )}\n*Local time: ${this.displayLocalTime(timeZone)}*`
      );
    } else {
      const userTimeZone = await this.timeAndDateService.getUserTimeZone(
        this.ctx,
        this.author.id
      );

      embed.setDescription(
        `
**Your current timezone**: \`${(
          userTimeZone?.asString() || "unset"
        ).toLowerCase()}\` ${
          userTimeZone
            ? `\n*Local time: ${this.displayLocalTime(userTimeZone)}*`
            : ""
        }
      
A list of all accepted timezones can be ${displayLink(
          "found here",
          this.timeZoneListLink
        )}.

You can set your time zone with \`${this.prefix}tz Continent/City\``
      );
    }

    await this.send(embed);
  }

  private displayLocalTime(userTimeZone: TimeZoneType): string {
    return format(userTimeZone.apply(new Date()), "y-MM-dd HH:mm:ss");
  }
}
