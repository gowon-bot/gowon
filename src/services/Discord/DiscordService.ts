import {
  CommandInteraction,
  DMChannel,
  InteractionReplyOptions,
  Message,
  MessageEmbed,
  MessagePayload,
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
import { Payload } from "../../lib/context/Payload";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";

type DiscordServiceContext = GowonContext<{
  mutable?: {
    replied?: boolean;
    deferred?: boolean;
    deferredResponseTimeout?: NodeJS.Timeout;
  };
}>;

export class DiscordService extends BaseService<DiscordServiceContext> {
  private get analyticsCollector() {
    return ServiceRegistry.get(AnalyticsCollector);
  }

  public async startTyping(ctx: GowonContext) {
    if (ctx.payload.isMessage()) {
      // Sometimes Discord throws 500 errors on this call
      // To reduce the amount of errors when discord is crashing
      // this is try / caught
      try {
        ctx.payload.channel!.sendTyping();
      } catch {}
    }
  }

  public async send(
    ctx: DiscordServiceContext,
    content: string | MessageEmbed,
    options?: Partial<SendOptions>
  ): Promise<Message> {
    const channel = this.getChannel(ctx, options);

    this.log(
      ctx,
      `Sending ${typeof content === "string" ? "string" : "embed"} ${
        this.shouldReply(options) ? "reply" : "message"
      } in ${
        channel instanceof DMChannel || isPartialDMChannel(channel)
          ? channel.recipient.tag
          : `#${channel.name}`
      }`
    );

    const end = this.analyticsCollector.metrics.discordLatency.startTimer();

    let response: Message;

    if (typeof content === "string") {
      response = await this.sendString(ctx, content, options);
    } else {
      const channel = this.getChannel(ctx, options);
      try {
        if (this.shouldReplyToInteraction(ctx, options)) {
          return await this.replyToInteraction(ctx, content, options);
        }

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

  async edit(
    ctx: DiscordServiceContext,
    message: Message,
    content: string | MessageEmbed
  ) {
    if (ctx.payload.isInteraction()) {
      this.log(ctx, `Editing interaction reply`);

      return await ctx.payload.source.editReply(
        typeof content === "string" ? { content } : { embeds: [content] }
      );
    } else {
      this.log(ctx, `Editing message ${message.id}`);

      return await message.edit(
        typeof content === "string" ? { content } : { embeds: [content] }
      );
    }
  }

  private shouldReply(options?: Partial<SendOptions>): boolean {
    return typeof options?.reply === "boolean"
      ? options.reply
      : !!Object.keys(options?.reply || {}).length;
  }

  private async sendString(
    ctx: DiscordServiceContext,
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
      if (this.shouldReplyToInteraction(ctx, options)) {
        return await this.replyToInteraction(ctx, content, options);
      }

      return await channel.send({
        content: messageContent,
        embeds: options?.withEmbed ? [options?.withEmbed] : [],
        reply:
          shouldReply && ctx.payload.isMessage()
            ? {
                messageReference: replyOptions.to || ctx.payload.source,
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
  ): RespondableChannel {
    return options?.inChannel || ctx.payload.channel;
  }

  private areDMsTurnedOff(e: any): boolean {
    return !!e.message
      ?.toLowerCase()
      ?.includes("cannot send messages to this user");
  }

  private shouldReplyToInteraction(
    ctx: GowonContext,
    options?: Partial<SendOptions>
  ): boolean {
    return (
      ctx.payload.isInteraction() &&
      (!options?.inChannel ||
        options?.inChannel?.id === ctx.payload.channel.id) &&
      !options?.forceNoInteractionReply
    );
  }

  private async replyToInteraction(
    ctx: DiscordServiceContext,
    content: string | MessageEmbed,
    options: Partial<SendOptions> | undefined
  ): Promise<Message> {
    const payload = ctx.payload as Payload<CommandInteraction>;

    const sendContent =
      typeof content === "string" ? { content } : { embeds: [content] };

    const sendOptions = {
      ...sendContent,
      fetchReply: true,
      files: options?.files,
      ephemeral: options?.ephemeral,
    } as MessagePayload | InteractionReplyOptions;

    const response = ctx.mutable.deferred
      ? await payload.source.editReply(sendOptions)
      : ctx.mutable.replied
      ? await payload.source.followUp(sendOptions)
      : await payload.source.reply(sendOptions);

    ctx.mutable.replied = true;
    ctx.mutable.deferred = false;

    if (ctx.mutable.deferredResponseTimeout) {
      clearTimeout(ctx.mutable.deferredResponseTimeout);
    }

    return response as Message;
  }
}

type RespondableChannel =
  | DMChannel
  | TextChannel
  | PartialDMChannel
  | ThreadChannel
  | NewsChannel;

export interface ReplyOptions {
  to?: MessageResolvable;
  ping?: boolean;
  noUppercase?: boolean;
}

export interface SendOptions {
  inChannel: RespondableChannel;
  withEmbed: MessageEmbed;
  reply: boolean | ReplyOptions;
  files: string[];
  forceNoInteractionReply?: boolean;
  ephemeral?: boolean;
}

function isPartialDMChannel(
  channel: RespondableChannel
): channel is PartialDMChannel {
  return channel.partial;
}
