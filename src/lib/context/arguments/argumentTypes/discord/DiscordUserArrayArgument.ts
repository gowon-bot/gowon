import { Message, User } from "discord.js";
import {
  BaseArgument,
  BaseArgumentOptions,
  SliceableArgumentOptions,
  defaultIndexableOptions,
} from "../BaseArgument";

export interface DiscordUserArrayArgumentOptions
  extends BaseArgumentOptions,
    SliceableArgumentOptions {}

export class DiscordUserArrayArgument<
  OptionsT extends Partial<DiscordUserArrayArgumentOptions>
> extends BaseArgument<User[], DiscordUserArrayArgumentOptions, OptionsT> {
  mention = true;

  constructor(options?: OptionsT) {
    super({ ...defaultIndexableOptions, ...(options ?? {}) } as OptionsT);
  }

  parseFromMessage(message: Message): User[] {
    const mentions = Array.from(message.mentions.users.values());

    const element = this.getElementFromIndex(mentions, this.options.index);

    return element instanceof Array ? element : element ? [element] : [];
  }

  parseFromCommandInteraction(): User[] {
    return [];
  }
}
