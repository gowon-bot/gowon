import { Message, Role } from "discord.js";
import {
  BaseArgument,
  BaseArgumentOptions,
  defaultIndexableOptions,
  IndexableArgumentOptions,
} from "../BaseArgument";

export interface DiscordRoleArgumentOptions
  extends BaseArgumentOptions,
    IndexableArgumentOptions {}

export class DiscordRoleArgument extends BaseArgument<
  Role,
  DiscordRoleArgumentOptions
> {
  mention = true;

  constructor(options: Partial<DiscordRoleArgumentOptions> = {}) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(message: Message): Role {
    const mentions = Array.from(message.mentions.roles.values());

    return this.getElementFromIndex(mentions, this.options.index);
  }

  parseFromInteraction(): Role {
    return {} as Role;
  }
}
