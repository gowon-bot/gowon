import { CommandInteraction, Message } from "discord.js";
import { GowonContext } from "../../Context";
import { BaseMention } from "../mentionTypes/BaseMention";
import {
  BaseArgument,
  BaseArgumentOptions,
  defaultIndexableOptions,
  IndexableArgumentOptions,
  StringCleaningArgument,
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
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(_: Message, content: string): string {
    const mentions = this.options.mention.parse(content);

    return this.getElementFromIndex(mentions, this.options.index);
  }

  parseFromInteraction(
    interaction: CommandInteraction,
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
