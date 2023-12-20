import {
  CommandInteraction,
  DMChannel,
  InteractionReplyOptions,
  Message,
  MessageEmbed,
  MessagePayload,
} from "discord.js";
import { AnalyticsCollector } from "../../analytics/AnalyticsCollector";
import { DMsAreOffError } from "../../errors/errors";
import { sleep } from "../../helpers";
import { uppercaseFirstLetter } from "../../helpers/string";
import { GowonContext } from "../../lib/context/Context";
import { Payload } from "../../lib/context/Payload";
import { Sendable } from "../../lib/ui/Sendable";
import { displayUserTag } from "../../lib/ui/displays";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { DiscordServiceContext } from "./DiscordService";
import {
  RespondableChannel,
  SendOptions,
  isPartialDMChannel,
} from "./DiscordService.types";

export class DiscordResponseService extends BaseService<DiscordServiceContext> {
  protected get analyticsCollector() {
    return ServiceRegistry.get(AnalyticsCollector);
  }

  public async startTyping(ctx: GowonContext) {
    if (ctx.payload.isMessage()) {
      // Sometimes Discord throws 403 errors on this call
      // To reduce the amount of errors when discord is crashing
      // this is try / caught
      try {
        await ctx.payload.channel!.sendTyping();
      } catch {}
    }
  }

  public async send(
    ctx: DiscordServiceContext,
    sendable: Sendable,
    options?: Partial<SendOptions>
  ): Promise<Message> {
    const channel = this.getChannel(ctx, options);

    this.log(
      ctx,
      `Sending ${typeof sendable === "string" ? "string" : "embed"} ${
        this.shouldReply(options) ? "reply" : "message"
      } in ${
        channel instanceof DMChannel || isPartialDMChannel(channel)
          ? displayUserTag(channel.recipient)
          : `#${channel.name}`
      }`
    );

    const end = this.analyticsCollector.metrics.discordLatency.startTimer();

    let response: Message;

    if (typeof sendable === "string") {
      response = await this.sendString(ctx, sendable, options);
    } else {
      const channel = this.getChannel(ctx, options);

      try {
        if (this.shouldReplyToInteraction(ctx, options)) {
          return await this.replyToInteraction(ctx, sendable, options);
        }

        response = await channel.send(sendable.asDiscordSendOptions(options));
      } catch (e) {
        throw this.areDMsTurnedOff(e) ? new DMsAreOffError() : e;
      }
    }

    end();

    sendable.afterSend(response);

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
    sendable: Sendable<string>,
    options?: Partial<SendOptions>
  ): Promise<Message> {
    const shouldReply = this.shouldReply(options);

    const replyOptions = Object.assign(
      { ping: false },
      typeof options?.reply === "object" ? options.reply : {}
    );

    const messageContent =
      shouldReply && !replyOptions.noUppercase
        ? uppercaseFirstLetter(sendable.content)
        : sendable.content;

    const channel = this.getChannel(ctx, options);

    try {
      if (this.shouldReplyToInteraction(ctx, options)) {
        return await this.replyToInteraction(ctx, sendable, options);
      }

      return await channel.send({
        ...sendable.asDiscordSendOptions(),
        content: messageContent,
        reply:
          shouldReply && ctx.payload.isMessage()
            ? {
                messageReference: replyOptions.to || ctx.payload.source,
              }
            : undefined,
        allowedMentions: shouldReply
          ? { repliedUser: replyOptions.ping }
          : undefined,
      });
    } catch (e) {
      throw this.areDMsTurnedOff(e) ? new DMsAreOffError() : e;
    }
  }

  private getChannel(
    ctx: GowonContext,
    options?: Partial<SendOptions>
  ): RespondableChannel {
    return (options?.inChannel || ctx.payload.channel) as RespondableChannel;
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
      !options?.inChannel &&
      !options?.forceNoInteractionReply
    );
  }

  private async replyToInteraction(
    ctx: DiscordServiceContext,
    sendable: Sendable,
    options: Partial<SendOptions> | undefined
  ): Promise<Message> {
    const payload = ctx.payload as Payload<CommandInteraction>;

    const sendOptions = {
      ...sendable.asDiscordSendOptions(options),
      fetchReply: true,
    } as MessagePayload | InteractionReplyOptions;

    // Discord doesn't like if you defer a message and then try and
    // edit it too quickly, so wait a little
    const difference = ctx.mutable.deferredAt
      ? ctx.mutable.deferredAt.getTime() - new Date().getTime()
      : Infinity;

    if (difference < 300) {
      await sleep(300 - difference);
    }

    const response = ctx.mutable.deferredAt
      ? payload.source.editReply(sendOptions)
      : ctx.mutable.replied
      ? await payload.source.followUp(sendOptions)
      : await payload.source.reply(sendOptions);

    ctx.mutable.replied = true;
    ctx.mutable.deferredAt = undefined;

    if (ctx.mutable.deferredResponseTimeout) {
      clearTimeout(ctx.mutable.deferredResponseTimeout);
    }

    return response as Message;
  }
}
