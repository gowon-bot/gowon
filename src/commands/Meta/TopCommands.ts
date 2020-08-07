import { Message, MessageEmbed } from "discord.js";
import { MetaChildCommand } from "./MetaChildCommand";
import { numberDisplay } from "../../helpers";
import { CommandManager } from "../../lib/command/CommandManager";
import { Arguments } from "../../lib/arguments/arguments";
import {
  generateTimeRange,
  generateHumanTimeRange,
  TimeRange,
} from "../../helpers/date";

export class TopCommands extends MetaChildCommand {
  description = "Shows the most used commands";

  arguments: Arguments = {
    inputs: {
      timeRange: {
        custom: (messageString: string) => generateTimeRange(messageString),
        index: -1,
      },
      humanReadableTimeRange: {
        custom: (messageString: string) =>
          generateHumanTimeRange(messageString, { noOverall: true }),
        index: -1,
      },
    },
  };

  async run(message: Message) {
    let timeRange = this.parsedArguments.timeRange as TimeRange,
      humanReadableTimeRange = this.parsedArguments
        .humanReadableTimeRange as string;

    let topCommands = (
      await this.metaService.mostUsedCommands(message.guild?.id!, timeRange)
    ).slice(0, 10);

    let commandManager = new CommandManager();
    await commandManager.init();

    let embed = new MessageEmbed()
      .setTitle(`Top commands in ${message.guild?.name!} ${humanReadableTimeRange}`)
      .setDescription(
        topCommands.map(
          (tc) =>
            `${numberDisplay(tc.count, "run")} - ${(
              commandManager.findByID(tc.commandID)?.friendlyNameWithParent ??
              "[deleted command]"
            ).bold()}`
        )
      );

    await message.channel.send(embed);
  }
}
