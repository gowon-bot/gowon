import { BaseService } from "../BaseService";
import { Message } from "discord.js";
import { CommandRun } from "../../database/entity/meta/CommandRun";

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
}
