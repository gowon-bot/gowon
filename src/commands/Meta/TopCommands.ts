import { Message, MessageEmbed } from "discord.js";
import { MetaChildCommand } from "./MetaChildCommand";
import { numberDisplay } from "../../helpers";
import { CommandManager } from "../../lib/command/CommandManager";
import { Arguments } from "../../lib/arguments/arguments";
import {
  TimeRange,
  timeRangeParser,
  humanizedTimeRangeParser,
} from "../../helpers/date";

export class TopCommands extends MetaChildCommand {
  description = "Shows the most used commands";
  usage = ["", "time period"];

  arguments: Arguments = {
    inputs: {
      timeRange: { custom: timeRangeParser(), index: -1 },
      humanizedTimeRange: {
        custom: humanizedTimeRangeParser({ noOverall: true }),
        index: -1,
      },
    },
  };

  async run(message: Message) {
    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanizedTimeRange = this.parsedArguments.humanizedTimeRange as string;

    let topCommands = (
      await this.metaService.mostUsedCommands(message.guild?.id!, timeRange)
    ).slice(0, 10);

    let commandManager = new CommandManager();
    await commandManager.init();

    let embed = new MessageEmbed()
      .setTitle(`Top commands in ${message.guild?.name!} ${humanizedTimeRange}`)
      .setDescription(
        topCommands.map(
          (tc) =>
            `${numberDisplay(tc.count, "run")} - ${(
              commandManager.findByID(tc.commandID)?.friendlyNameWithParent ??
              "[deleted command]"
            ).bold()}`
        )
      );

    await this.send(embed);
  }
}
