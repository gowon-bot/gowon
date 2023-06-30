import { ChatInputCommandInteraction, Message, User } from "discord.js";
import { isGowon } from "../../../../../helpers/bots";
import { GowonContext } from "../../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  IndexableArgumentOptions,
  defaultIndexableOptions,
} from "../BaseArgument";
import { SlashCommandBuilder } from "../SlashCommandTypes";

export interface DiscordUserArgumentOptions
  extends BaseArgumentOptions,
    IndexableArgumentOptions {}

export class DiscordUserArgument<
  OptionsT extends Partial<DiscordUserArgumentOptions>
> extends BaseArgument<User, DiscordUserArgumentOptions, OptionsT> {
  mention = true;

  constructor(options?: OptionsT) {
    super({ ...defaultIndexableOptions, ...(options ?? {}) } as OptionsT);
  }

  parseFromMessage(message: Message): User | undefined {
    let mentions = Array.from(message.mentions.users.values());

    // Run with mention prefix
    if (message.content.startsWith("<")) {
      mentions = mentions.slice(1);
    }

    if (isGowon(message.mentions.repliedUser?.id ?? "")) {
      mentions = mentions.filter(
        (m) => m.id !== message.mentions.repliedUser!.id
      );
    }

    return this.getElementFromIndex(mentions, this.options.index);
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addUserOption((option) =>
      this.baseOption(option, argumentName)
    );
  }

  parseFromCommandInteraction(
    interaction: ChatInputCommandInteraction,
    _: GowonContext,
    argumentName: string
  ): User {
    return interaction.options.getUser(argumentName)!;
  }
}
