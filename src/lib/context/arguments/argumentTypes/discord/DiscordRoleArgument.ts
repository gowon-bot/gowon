import {
  ChatInputCommandInteraction,
  Message,
  Role,
  SlashCommandBuilder,
} from "discord.js";
import { GowonContext } from "../../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  IndexableArgumentOptions,
  defaultIndexableOptions,
} from "../BaseArgument";

export interface DiscordRoleArgumentOptions
  extends BaseArgumentOptions,
    IndexableArgumentOptions {}

export class DiscordRoleArgument<
  OptionsT extends Partial<DiscordRoleArgumentOptions> = {}
> extends BaseArgument<Role, DiscordRoleArgumentOptions, OptionsT> {
  mention = true;

  constructor(options?: OptionsT) {
    super({ ...defaultIndexableOptions, ...(options ?? {}) } as OptionsT);
  }

  parseFromMessage(message: Message): Role | undefined {
    const mentions = Array.from(message.mentions.roles.values());

    return this.getElementFromIndex(mentions, this.options.index);
  }

  parseFromInteraction(
    interaction: ChatInputCommandInteraction,
    _: GowonContext,
    argumentName: string
  ): Role | undefined {
    return (interaction.options.getRole(argumentName) as Role) ?? undefined;
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addRoleOption((option) =>
      this.baseOption(option, argumentName)
    );
  }
}
