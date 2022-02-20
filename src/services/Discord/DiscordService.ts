import {
  DMChannel,
  Message,
  MessageEmbed,
  MessageResolvable,
  NewsChannel,
  PartialDMChannel,
  TextChannel,
  ThreadChannel,
} from "discord.js";
import { AnalyticsCollector } from "../../analytics/AnalyticsCollector";
import { DMsAreOffError } from "../../errors";
import { ucFirst } from "../../helpers";
import { GowonContext } from "../../lib/context/Context";
import { isMessage } from "../../lib/context/Payload";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";

type RespondableChannels =
  | TextChannel
  | DMChannel
  | PartialDMChannel
  | ThreadChannel
  | NewsChannel;

export interface ReplyOptions {
  to?: MessageResolvable;
  ping?: boolean;
  noUppercase?: boolean;
}

export interface SendOptions {
  inChannel: RespondableChannels;
  withEmbed: MessageEmbed;
  reply: boolean | ReplyOptions;
  files: string[];
}

export class DiscordService extends BaseService {
  private get analyticsCollector() {
    return ServiceRegistry.get(AnalyticsCollector);
  }

  public async startTyping(ctx: GowonContext) {
    if (isMessage(ctx.payload)) {
      // Sometimes Discord throws 500 errors on this call
      // To reduce the amount of errors when discord is crashing
      // this is try / caught
      try {
        ctx.payload.channel.sendTyping();
      } catch {}
    }
  }

  public async send(
    ctx: GowonContext,
    content: string | MessageEmbed,
    options?: Partial<SendOptions>
  ): Promise<Message> {
    const end = this.analyticsCollector.metrics.discordLatency.startTimer();

    let response: Message;

    if (typeof content === "string") {
      response = await this.sendString(ctx, content, options);
    } else {
      const channel = this.getChannel(ctx, options);
      try {
        response = await channel.send({
          embeds: options?.withEmbed ? [content, options.withEmbed] : [content],
          files: options?.files,
        });
      } catch (e) {
        throw this.areDMsTurnedOff(e) ? new DMsAreOffError() : e;
      }
    }

    end();

    return response;
  }

  private shouldReply(options?: Partial<SendOptions>): boolean {
    return typeof options?.reply === "boolean"
      ? options.reply
      : !!Object.keys(options?.reply || {}).length;
  }

  private async sendString(
    ctx: GowonContext,
    content: string,
    options?: Partial<SendOptions>
  ): Promise<Message> {
    const shouldReply = this.shouldReply(options);

    const replyOptions = Object.assign(
      { ping: false },
      typeof options?.reply === "object" ? options.reply : {}
    );

    const messageContent =
      shouldReply && !replyOptions.noUppercase ? ucFirst(content) : content;

    const channel = this.getChannel(ctx, options);

    try {
      return await channel.send({
        content: messageContent,
        embeds: options?.withEmbed ? [options?.withEmbed] : [],
        reply: shouldReply
          ? {
              messageReference: replyOptions.to || ctx.payload,
            }
          : undefined,
        allowedMentions: shouldReply
          ? { repliedUser: replyOptions.ping }
          : undefined,
        files: options?.files,
      });
    } catch (e) {
      throw this.areDMsTurnedOff(e) ? new DMsAreOffError() : e;
    }
  }

  private getChannel(
    ctx: GowonContext,
    options?: Partial<SendOptions>
  ): RespondableChannels {
    return options?.inChannel || ctx.payload.channel;
  }

  private areDMsTurnedOff(e: any): boolean {
    return !!e.message
      ?.toLowerCase()
      ?.includes("cannot send messages to this user");
  }
}
