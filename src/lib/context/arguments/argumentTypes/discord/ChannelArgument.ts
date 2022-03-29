import { Channel, CommandInteraction, Interaction, Message } from "discord.js";
import { GowonContext } from "../../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  defaultIndexableOptions,
  IndexableArgumentOptions,
  SliceableArgumentOptions,
} from "../BaseArgument";
import { SlashCommandBuilder } from "../SlashCommandTypes";

export interface ChannelArgumentOptions<T>
  extends BaseArgumentOptions<T>,
    IndexableArgumentOptions {}

export class ChannelArgument<
  OptionsT extends Partial<ChannelArgumentOptions<Channel>> = {}
> extends BaseArgument<Channel, ChannelArgumentOptions<Channel>, OptionsT> {
  constructor(options: Partial<ChannelArgumentOptions<Channel>> | {} = {}) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(message: Message, _: string): Channel | undefined {
    const channels = Array.from(message.mentions.channels.values());

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

export class ChannelArrayArgument extends BaseArgument<
  Channel[],
  SliceableArgumentOptions & ChannelArgumentOptions<Channel[]>
> {
  constructor(options: Partial<ChannelArgumentOptions<Channel[]>> | {} = {}) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(message: Message, _: string): Channel[] {
    const channels = Array.from(message.mentions.channels.values());

    const element = this.getElementFromIndex(channels, this.options.index);

    if (element instanceof Channel) return [element];
    return element;
  }

  parseFromInteraction(interaction: Interaction): Channel[] {
    return [interaction.channel! as Channel];
  }
}
