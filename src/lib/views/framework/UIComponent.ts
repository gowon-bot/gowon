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
  constructor(protected options: Partial<UIComponentOptions>) {}

  asMessageEmbed(): MessageEmbed {
    return new MessageEmbed();
  }

  public getFiles(): NonNullable<MessageOptions["files"]> {
    return [];
  }

  public isEphemeral(): boolean {
    return this.options.ephemeral ?? false;
  }

  public async afterSend(message: Message) {
    if (this.options.reacts) {
      for (const react of this.options.reacts) {
        await message.react(react);
      }
    }
  }
}
