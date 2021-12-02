import { BaseService, BaseServiceContext } from "../BaseService";
import { Message } from "discord.js";
import {
  CommandRun,
  MostUsedCommandsResponse,
} from "../../database/entity/meta/CommandRun";
import { TimeRange } from "../../lib/timeAndDate/helpers";

export class MetaService extends BaseService {
  async recordCommandRun(
    ctx: BaseServiceContext,
    commandID: string,
    message: Message
  ) {
    this.log(ctx, `Logging command ${commandID} in ${message.guild?.id}`);

    let commandRun = CommandRun.create({
      commandID,
      channelID: message.channel.id,
      serverID: message.guild?.id!,
      userID: message.author.id,
    });

    await commandRun.save();
  }

  async mostUsedCommands(
    ctx: BaseServiceContext,
    timeRange?: TimeRange
  ): Promise<MostUsedCommandsResponse[]> {
    const serverID = this.guild(ctx).id;

    this.log(ctx, `Counting most used commands in ${serverID}`);

    return await CommandRun.mostUsedCommands(serverID, timeRange);
  }

  async countCommandRuns(ctx: BaseServiceContext, commandID: string) {
    this.log(ctx, `Counting command runs for command ${commandID}`);

    return await CommandRun.count({ commandID });
  }

  async hasRunCommand(
    ctx: BaseServiceContext,
    userID: string,
    commandID: string,
    tolerance = 0
  ): Promise<boolean> {
    this.log(ctx, `Checking if ${userID} has run ${commandID}`);

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
