import {
  EmojiResolvable,
  Message,
  MessageEmbed,
  MessageOptions,
} from "discord.js";

export interface UIComponentOptions {
  reacts: EmojiResolvable[];
  ephemeral: boolean;
}

export abstract class UIComponent {
  constructor(protected componentOptions: Partial<UIComponentOptions> = {}) {}

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
}
