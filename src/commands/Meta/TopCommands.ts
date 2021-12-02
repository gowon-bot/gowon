import { Message } from "discord.js";
import { MetaChildCommand } from "./MetaChildCommand";
import { Arguments } from "../../lib/arguments/arguments";
import { displayNumber } from "../../lib/views/displays";
import { TimeRangeParser } from "../../lib/arguments/custom/TimeRangeParser";
import { humanizeTimeRange } from "../../lib/timeAndDate/helpers";

const args = {
  inputs: {
    timeRange: { custom: new TimeRangeParser({ useOverall: false }) },
  },
} as const;

export class TopCommands extends MetaChildCommand<typeof args> {
  idSeed = "eunha";

  description = "Shows the most used commands over a given time period";
  usage = ["", "time period"];

  arguments: Arguments = args;

  async run(message: Message) {
    const timeRange = this.parsedArguments.timeRange!;
    const humanizedTimeRange = humanizeTimeRange(timeRange, {
      useOverall: false,
    });

    const topCommands = (
      await this.metaService.mostUsedCommands(this.ctx, timeRange)
    ).slice(0, 10);

    const embed = this.newEmbed()
      .setTitle(`Top commands in ${message.guild?.name!} ${humanizedTimeRange}`)
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
