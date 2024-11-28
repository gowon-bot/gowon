import { CommandInteraction, Message, MessageAttachment } from "discord.js";
import { GowonContext } from "../../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  IndexableArgumentOptions,
  defaultIndexableOptions,
} from "../BaseArgument";
import { SlashCommandBuilder } from "../SlashCommandTypes";

export interface AttachmentArgumentOptions
  extends BaseArgumentOptions<MessageAttachment>,
    IndexableArgumentOptions {}

export class AttachmentArgument<
  OptionsT extends Partial<AttachmentArgumentOptions>
> extends BaseArgument<MessageAttachment, AttachmentArgumentOptions, OptionsT> {
  constructor(options?: OptionsT) {
    super({ ...defaultIndexableOptions, ...(options ?? {}) } as OptionsT);
  }

  parseFromMessage(message: Message, _: string): MessageAttachment | undefined {
    const attachments = Array.from(message.attachments.values());

    return this.getElementFromIndex(attachments, this.options.index);
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): MessageAttachment | undefined {
    return interaction.options.getAttachment(argumentName) ?? undefined;
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addAttachmentOption((option) =>
      this.baseOption(option, argumentName)
    );
  }
}
