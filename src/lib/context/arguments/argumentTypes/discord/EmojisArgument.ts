import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, Message } from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { GowonContext } from "../../../Context";
import { EmojiMention, EmojiParser } from "../../parsers/EmojiParser";
import {
  BaseArgument,
  BaseArgumentOptions,
  SliceableArgumentOptions,
  defaultIndexableOptions,
} from "../BaseArgument";

export interface EmojisArgumentOptions
  extends BaseArgumentOptions<EmojiMention[]>,
    SliceableArgumentOptions {}

export class EmojisArgument<
  OptionsT extends Partial<EmojisArgumentOptions> = {}
> extends BaseArgument<EmojiMention[], EmojisArgumentOptions, OptionsT> {
  private emojiParser = new EmojiParser();

  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(options?: OptionsT) {
    super({
      ...defaultIndexableOptions,
      ...(options ?? {}),
    } as OptionsT);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): EmojiMention[] | undefined {
    const cleanContent = this.cleanContent(ctx, content);

    return (
      this.parseFromString(cleanContent) ||
      (this.options.default as EmojiMention[])
    );
  }

  parseFromInteraction(
    interaction: CommandInteraction,
    _: GowonContext,
    argumentName: string
  ): EmojiMention[] | undefined {
    const string = interaction.options.getString(argumentName)!;

    const parsed = string ? this.parseFromString(string) : undefined;

    return parsed || this.getDefault();
  }

  addAsOption(slashCommand: SlashCommandBuilder, argumentName: string) {
    return slashCommand.addStringOption((option) => {
      return this.baseOption(option, argumentName);
    });
  }

  private parseFromString(string: string): EmojiMention[] | undefined {
    const emojis = this.emojiParser.parse(string);

    const element = this.getElementFromIndex(emojis, this.options.index);

    return element instanceof Array || element === undefined
      ? element
      : [element];
  }
}
