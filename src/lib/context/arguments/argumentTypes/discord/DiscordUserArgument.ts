import { Message, User } from "discord.js";
import {
  BaseArgument,
  defaultIndexableOptions,
  IndexableArgumentOptions,
} from "../BaseArgument";

export interface DiscordUserArgumentOptions extends IndexableArgumentOptions {}

export class DiscordUserArgument extends BaseArgument<
  User,
  DiscordUserArgumentOptions
> {
  mention = true;

  constructor(options: Partial<DiscordUserArgumentOptions> = {}) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(message: Message): User {
    const mentions = Array.from(message.mentions.users.values());

    return this.getElementFromIndex(mentions, this.options.index);
  }

  parseFromInteraction(): User {
    return {} as User;
  }
}
