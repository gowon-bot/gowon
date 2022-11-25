import { Message, User } from "discord.js";
import {
  BaseArgument,
  BaseArgumentOptions,
  defaultIndexableOptions,
  SliceableArgumentOptions,
} from "../BaseArgument";

export interface DiscordUserArrayArgumentOptions
  extends BaseArgumentOptions,
  SliceableArgumentOptions { }

export class DiscordUserArrayArgument<
  OptionsT extends Partial<DiscordUserArrayArgumentOptions>
> extends BaseArgument<
  User[],
  DiscordUserArrayArgumentOptions,
  OptionsT
> {
  mention = true;

  constructor(options?: OptionsT) {
    super({ ...defaultIndexableOptions, ...(options ?? {}) } as OptionsT);
  }

  parseFromMessage(message: Message): User[] {
    const mentions = Array.from(message.mentions.users.values());

    return this.getElementFromIndex(mentions, this.options.index);
  }

  parseFromInteraction(): User[] {
    return [];
  }
}
