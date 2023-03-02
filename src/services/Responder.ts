import { Message, MessageEmbed } from "discord.js";

import { GowonContext } from "../lib/context/Context";
import { BaseService } from "./BaseService";
import { DiscordService, SendOptions } from "./Discord/DiscordService";
import { ServiceRegistry } from "./ServicesRegistry";

export class Responder extends BaseService {
  private get discordService() {
    return ServiceRegistry.get(DiscordService);
  }

  async discord(
    ctx: GowonContext,
    content: string | MessageEmbed,
    options?: Partial<SendOptions>
  ): Promise<Message | undefined> {
    if (ctx.payload.isInteraction() || ctx.payload.isMessage()) {
      return await this.discordService.send(ctx, content, options);
    } else return undefined;
  }

  async all(
    ctx: GowonContext,
    content: string,
    options?: Partial<{ discord: SendOptions }>
  ): Promise<Message | undefined> {
    if (ctx.payload.isInteraction() || ctx.payload.isMessage()) {
      return await this.discord(ctx, content, options?.discord);
    }

    return undefined;
  }
}
