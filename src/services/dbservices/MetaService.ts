import { Message } from "discord.js";
import {
  CommandRun,
  MostUsedCommandsResponse,
} from "../../database/entity/meta/CommandRun";
import { GowonContext } from "../../lib/context/Context";
import { TimeRange } from "../../lib/timeAndDate/TimeRange";
import { BaseService } from "../BaseService";

export class MetaService extends BaseService {
  async recordCommandRun(
    ctx: GowonContext,
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
    ctx: GowonContext,
    timeRange?: TimeRange
  ): Promise<MostUsedCommandsResponse[]> {
    const serverID = ctx.requiredGuild.id;

    this.log(ctx, `Counting most used commands in ${serverID}`);

    return await CommandRun.mostUsedCommands(serverID, timeRange);
  }

  async countCommandRuns(ctx: GowonContext, commandID: string) {
    this.log(ctx, `Counting command runs for command ${commandID}`);

    return await CommandRun.countBy({ commandID });
  }

  async hasRunCommand(
    ctx: GowonContext,
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
