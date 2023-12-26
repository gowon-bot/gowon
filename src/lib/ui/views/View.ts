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

export interface DiscordSendable {
  toMessageEmbed(): MessageEmbed;
}

export abstract class View {
  protected sentMessage?: Message;

  constructor(protected componentOptions: Partial<ViewOptions> = {}) {}

  abstract asDiscordSendable(): DiscordSendable;

  public async editMessage(ctx: GowonContext) {
    const discordService = ServiceRegistry.get(DiscordService);

    await discordService.edit(ctx, this.getSentMessage(), new Sendable(this));
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

  public async afterSend(message: Message) {
    this.sentMessage = message;

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
