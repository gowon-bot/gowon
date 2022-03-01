import { MetaChildCommand } from "./MetaChildCommand";
import { displayNumber } from "../../lib/views/displays";
import { humanizeTimeRange, TimeRange } from "../../lib/timeAndDate/helpers";
import { TimeRangeArgument } from "../../lib/context/arguments/argumentTypes/timeAndDate/TimeRangeArgument";

const args = {
  timeRange: new TimeRangeArgument({
    useOverall: false,
    default: TimeRange.fromDuration({ weeks: 1 }),
  }),
} as const;

export class TopCommands extends MetaChildCommand<typeof args> {
  idSeed = "eunha";

  description = "Shows the most used commands over a given time period";
  usage = ["", "time period"];

  arguments = args;

  async run() {
    const timeRange = this.parsedArguments.timeRange;
    const humanizedTimeRange = humanizeTimeRange(timeRange, {
      useOverall: false,
    });

    const topCommands = (
      await this.metaService.mostUsedCommands(this.ctx, timeRange)
    ).slice(0, 10);

    const embed = this.newEmbed()
      .setTitle(`Top commands in ${this.guild?.name!} ${humanizedTimeRange}`)
      .setDescription(
        topCommands
          .map(
            (tc) =>
              `${displayNumber(tc.count, "run")} - ${(
                this.commandRegistry.findByID(tc.commandID)
                  ?.friendlyNameWithParent ?? "[unknown command]"
              ).strong()}`
          )
          .join("\n")
      );

    await this.send(embed);
  }
}
