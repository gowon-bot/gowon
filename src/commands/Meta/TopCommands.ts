import { bold } from "../../helpers/discord";
import { DateRangeArgument } from "../../lib/context/arguments/argumentTypes/timeAndDate/DateRangeArgument";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { DateRange } from "../../lib/timeAndDate/DateRange";
import { humanizeDateRange } from "../../lib/timeAndDate/helpers/humanize";
import { displayNumber } from "../../lib/views/displays";
import { MetaChildCommand } from "./MetaChildCommand";

const args = {
  dateRange: new DateRangeArgument({
    useOverall: false,
    default: () => DateRange.fromDuration({ weeks: 1 }),
  }),
} satisfies ArgumentsMap;

export class TopCommands extends MetaChildCommand<typeof args> {
  idSeed = "eunha";

  description = "Shows the most used commands over a given time period";
  usage = ["", "time period"];

  arguments = args;

  async run() {
    const dateRange = this.parsedArguments.dateRange;
    const humanizedDateRange = humanizeDateRange(dateRange, {
      useOverall: false,
    });

    const topCommands = (
      await this.metaService.mostUsedCommands(this.ctx, dateRange)
    ).slice(0, 10);

    const embed = this.newEmbed()
      .setTitle(`Top commands in ${this.guild?.name!} ${humanizedDateRange}`)
      .setDescription(
        topCommands
          .map(
            (tc) =>
              `${displayNumber(tc.count, "run")} - ${bold(
                this.commandRegistry.findByID(tc.commandID)
                  ?.friendlyNameWithParent ?? "[unknown command]"
              )}`
          )
          .join("\n")
      );

    await this.send(embed);
  }
}
