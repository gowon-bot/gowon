import { CommandInteraction, Message, User } from "discord.js";
import { GowonContext } from "../../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  defaultIndexableOptions,
  IndexableArgumentOptions,
} from "../BaseArgument";
import { SlashCommandBuilder } from "../SlashCommandTypes";

export interface DiscordUserArgumentOptions
  extends BaseArgumentOptions,
    IndexableArgumentOptions {}

export class DiscordUserArgument extends BaseArgument<
  User,
  DiscordUserArgumentOptions
> {
  mention = true;

  constructor(options: Partial<DiscordUserArgumentOptions> = {}) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(message: Message): User {
    let mentions = Array.from(message.mentions.users.values());

    // Run with mention prefix
    if (message.content.startsWith("<")) {
      mentions = mentions.slice(1);
    }

    return this.getElementFromIndex(mentions, this.options.index);
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addUserOption((option) =>
      this.baseOption(option, argumentName)
    );
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): User {
    return interaction.options.getUser(argumentName)!;
  }
}
