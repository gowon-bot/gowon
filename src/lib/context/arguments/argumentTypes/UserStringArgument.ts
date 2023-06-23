import { ChatInputCommandInteraction, Message } from "discord.js";
import { GowonContext } from "../../Context";
import { BaseMention } from "../mentionTypes/BaseMention";
import {
  BaseArgument,
  BaseArgumentOptions,
  IndexableArgumentOptions,
  StringCleaningArgument,
  defaultIndexableOptions,
} from "./BaseArgument";
import { SlashCommandBuilder } from "./SlashCommandTypes";

export interface UserStringArgumentOptions
  extends BaseArgumentOptions<string>,
    IndexableArgumentOptions {
  mention: BaseMention;
}

export class UserStringArgument<
    OptionsT extends Partial<UserStringArgumentOptions>
  >
  extends BaseArgument<string, UserStringArgumentOptions, OptionsT>
  implements StringCleaningArgument
{
  mention = true;

  constructor(options?: OptionsT) {
    super({ ...defaultIndexableOptions, ...(options ?? {}) } as OptionsT);
  }

  parseFromMessage(_: Message, content: string): string | undefined {
    const mentions = this.options.mention.parse(content);

    return this.getElementFromIndex(mentions, this.options.index);
  }

  parseFromInteraction(
    interaction: ChatInputCommandInteraction,
    _: GowonContext,
    argumentName: string
  ): string {
    return interaction.options.getString(argumentName)!;
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addStringOption((option) =>
      this.baseOption(option, argumentName)
    );
  }

  public clean(string: string) {
    return this.options.mention.removeFrom(string);
  }
}
