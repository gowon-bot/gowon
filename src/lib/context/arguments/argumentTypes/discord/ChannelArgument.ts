import { Channel, ChatInputCommandInteraction, Message } from "discord.js";
import { GowonContext } from "../../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  IndexableArgumentOptions,
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
    interaction: ChatInputCommandInteraction,
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
