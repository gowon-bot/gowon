import { Message } from "discord.js";
import { MetaChildCommand } from "./MetaChildCommand";
import { CommandManager } from "../../lib/command/CommandManager";
import { Arguments } from "../../lib/arguments/arguments";
import { timeRangeParser, humanizedTimeRangeParser } from "../../helpers/date";
import { displayNumber } from "../../lib/views/displays";

const args = {
  inputs: {
    timeRange: { custom: timeRangeParser(), index: -1 },
    humanizedTimeRange: {
      custom: humanizedTimeRangeParser({ noOverall: true }),
      index: -1,
    },
  },
} as const;

export class TopCommands extends MetaChildCommand<typeof args> {
  idSeed = "eunha";

  description = "Shows the most used commands over a given time period";
  usage = ["", "time period"];

  arguments: Arguments = args;

  async run(message: Message) {
    let timeRange = this.parsedArguments.timeRange,
      humanizedTimeRange = this.parsedArguments.humanizedTimeRange;

    let topCommands = (
      await this.metaService.mostUsedCommands(message.guild?.id!, timeRange)
    ).slice(0, 10);

    let commandManager = new CommandManager();
    await commandManager.init();

    let embed = this.newEmbed()
      .setTitle(`Top commands in ${message.guild?.name!} ${humanizedTimeRange}`)
      .setDescription(
        topCommands
          .map(
            (tc) =>
              `${displayNumber(tc.count, "run")} - ${(
                commandManager.findByID(tc.commandID)?.friendlyNameWithParent ??
                "[unknown command]"
              ).strong()}`
          )
          .join("\n")
      );

    await this.send(embed);
  }
}
