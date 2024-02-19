import {
  EmojiResolvable,
  Message,
  MessageEmbed,
  MessageOptions,
} from "discord.js";
import { ViewHasNotBeenSentError } from "../../../errors/ui";
import { DiscordService } from "../../../services/Discord/DiscordService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { GowonContext } from "../../context/Context";
import { Sendable } from "../Sendable";

export interface ViewOptions {
  reacts: EmojiResolvable[];
  ephemeral: boolean;
}

export interface EmbedViewHooks {
  afterSend(message: Message): void | Promise<void>;
}

export interface DiscordSendable {
  toMessageEmbed(): MessageEmbed;
}

export abstract class View {
  protected sentMessage?: Message;
  protected hooks: Partial<EmbedViewHooks> = {
    afterSend: this.afterSendHook.bind(this),
  };

  constructor(protected componentOptions: Partial<ViewOptions> = {}) {}

  abstract asDiscordSendable(): DiscordSendable;

  public async editMessage(ctx: GowonContext) {
    const discordService = ServiceRegistry.get(DiscordService);

    await discordService.edit(ctx, this.getSentMessage(), new Sendable(this));
  }

  protected setSentMessage(message: Message | undefined): this {
    this.sentMessage = message;
    return this;
  }

  public setReacts(reacts: EmojiResolvable[]): this {
    this.componentOptions.reacts = reacts;
    return this;
  }

  public getFiles(): NonNullable<MessageOptions["files"]> {
    return [];
  }

  public isEphemeral(): boolean {
    return this.componentOptions.ephemeral ?? false;
  }

  public hook(
    hookName: keyof EmbedViewHooks,
    hook: EmbedViewHooks[typeof hookName]
  ): this {
    this.hooks[hookName] = chainHooks(this.hooks[hookName], hook);
    return this;
  }

  public async triggerHooks(
    hookName: keyof EmbedViewHooks,
    ...params: Parameters<EmbedViewHooks[typeof hookName]>
  ) {
    await Promise.resolve(this.hooks.afterSend?.(...params));
  }

  private async afterSendHook(message: Message) {
    this.setSentMessage(message);

    if (this.componentOptions.reacts) {
      for (const react of this.componentOptions.reacts) {
        await message.react(react);
      }
    }
  }

  public getSentMessage(): Message {
    if (!this.sentMessage) {
      throw new ViewHasNotBeenSentError();
    }

    return this.sentMessage;
  }

  public asSendable(): Sendable {
    return new Sendable(this);
  }
}

function chainHooks<T extends Function>(hook: T | undefined, incoming: T): T {
  return (async (...args: any[]) => {
    if (hook) await Promise.resolve(hook(...args));
    await Promise.resolve(incoming(...args));
  }) as any as T;
}
