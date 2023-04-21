import { Channel, CommandInteraction, Interaction, Message } from "discord.js";
import { GowonContext } from "../../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  IndexableArgumentOptions,
  SliceableArgumentOptions,
  defaultIndexableOptions,
} from "../BaseArgument";
import { SlashCommandBuilder } from "../SlashCommandTypes";

export interface ChannelArgumentOptions
  extends BaseArgumentOptions<Channel>,
    IndexableArgumentOptions {}

export class ChannelArgument<
  OptionsT extends Partial<ChannelArgumentOptions>
> extends BaseArgument<Channel, ChannelArgumentOptions, OptionsT> {
  constructor(options?: OptionsT) {
    super({ ...defaultIndexableOptions, ...(options ?? {}) } as OptionsT);
  }

  parseFromMessage(message: Message, _: string): Channel | undefined {
    const channels = Array.from(
      message.mentions.channels.values()
    ) as Channel[];

    return this.getElementFromIndex(channels, this.options.index);
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): Channel | undefined {
    return (
      (interaction.options.getChannel(argumentName) as Channel | null) ??
      undefined
    );
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addChannelOption((option) =>
      this.baseOption(option, argumentName)
    );
  }
}

export interface ChannelArrayArgumentOptions
  extends BaseArgumentOptions<Channel[]>,
    SliceableArgumentOptions {}

export class ChannelArrayArgument<
  OptionsT extends Partial<ChannelArrayArgumentOptions>
> extends BaseArgument<Channel[], ChannelArrayArgumentOptions, OptionsT> {
  constructor(options?: OptionsT) {
    super({ ...defaultIndexableOptions, ...(options ?? {}) } as OptionsT);
  }

  parseFromMessage(message: Message, _: string): Channel[] {
    const channels = Array.from(message.mentions.channels.values());

    const element = this.getElementFromIndex(channels, this.options.index);

    if (element instanceof Channel) return [element];

    return (element ?? []) as Channel[];
  }

  parseFromInteraction(interaction: Interaction): Channel[] {
    return [interaction.channel! as Channel];
  }
}
