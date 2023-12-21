import {
  EmojiResolvable,
  Message,
  MessageEmbed,
  MessageOptions,
} from "discord.js";
import { Sendable } from "../Sendable";

export interface ViewOptions {
  reacts: EmojiResolvable[];
  ephemeral: boolean;
}

export abstract class View {
  constructor(protected componentOptions: Partial<ViewOptions> = {}) {}

  asMessageEmbed(): MessageEmbed {
    return new MessageEmbed();
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
    if (this.componentOptions.reacts) {
      for (const react of this.componentOptions.reacts) {
        await message.react(react);
      }
    }
  }

  public asSendable(): Sendable {
    return new Sendable(this);
  }
}
