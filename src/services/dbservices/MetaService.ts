import { BaseService } from "../BaseService";
import { Message } from "discord.js";
import {
  CommandRun,
  MostUsedCommandsResponse,
} from "../../database/entity/meta/CommandRun";
import { TimeRange } from "../../helpers/date";

export class MetaService extends BaseService {
  async recordCommandRun(commandID: string, message: Message) {
    let commandRun = CommandRun.create({
      commandID,
      channelID: message.channel.id,
      serverID: message.guild?.id!,
      userID: message.author.id,
    });

    await commandRun.save();
  }

  async mostUsedCommands(
    serverID: string,
    timeRange?: TimeRange
  ): Promise<MostUsedCommandsResponse[]> {
    return await CommandRun.mostUsedCommands(serverID, timeRange);
  }

  async countCommandRuns(commandID: string) {
    return await CommandRun.count({ commandID });
  }

  async hasRunCommand(
    userID: string,
    commandID: string,
    tolerance = 0
  ): Promise<boolean> {
    this.log(`Checking if ${userID} has run ${commandID}`);

    return (
      (
        await CommandRun.find({
          take: tolerance + 1,
          where: {
            commandID,
            userID,
          },
        })
      ).length ===
      tolerance + 1
    );
  }
}
