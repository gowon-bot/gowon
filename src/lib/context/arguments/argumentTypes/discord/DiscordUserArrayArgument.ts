import { Message, User } from "discord.js";
import {
  BaseArgument,
  defaultIndexableOptions,
  SliceableArgumentOptions,
} from "../BaseArgument";

export interface DiscordUserArrayArgumentOptions
  extends SliceableArgumentOptions {}

export class DiscordUserArrayArgument extends BaseArgument<
  User[],
  DiscordUserArrayArgumentOptions
> {
  mention = true;

  constructor(options: Partial<DiscordUserArrayArgumentOptions> = {}) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(message: Message): User[] {
    const mentions = Array.from(message.mentions.users.values());

    return this.getElementFromIndex(mentions, this.options.index);
  }

  parseFromInteraction(): User[] {
    return [];
  }
}
