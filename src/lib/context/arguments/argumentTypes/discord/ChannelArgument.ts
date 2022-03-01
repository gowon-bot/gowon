import { Channel, Interaction, Message } from "discord.js";
import {
  BaseArgument,
  BaseArgumentOptions,
  defaultIndexableOptions,
  IndexableArgumentOptions,
  SliceableArgumentOptions,
} from "../BaseArgument";

export interface ChannelArgumentOptions extends BaseArgumentOptions {}

export class ChannelArgument extends BaseArgument<
  Channel,
  IndexableArgumentOptions & ChannelArgumentOptions
> {
  constructor(options: Partial<ChannelArgumentOptions> = {}) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(message: Message, _: string): Channel {
    const channels = Array.from(message.mentions.channels.values());

    return this.getElementFromIndex(channels, this.options.index);
  }

  parseFromInteraction(interaction: Interaction): Channel {
    return interaction.channel! as Channel;
  }
}

export class ChannelArrayArgument extends BaseArgument<
  Channel[],
  SliceableArgumentOptions & ChannelArgumentOptions
> {
  constructor(options: Partial<ChannelArgumentOptions> = {}) {
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
