import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from "discord.js";
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
    SliceableArgumentOptions {
  parse: "all" | "default" | "custom" | "animated";
}

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
      parse: "all",
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
    interaction: ChatInputCommandInteraction,
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
    let emojis: EmojiMention[] = [];

    switch (this.options.parse) {
      case "all":
        emojis = this.emojiParser.parseAll(string);
        break;
      case "default":
        emojis = this.emojiParser.parseDefaultEmotes(string);
        break;
      case "animated":
        emojis = this.emojiParser.parseAnimatedEmotes(string);
        break;
      case "custom":
        emojis = this.emojiParser.parseCustomEmotes(string);
        break;
    }

    const element = this.getElementFromIndex(emojis, this.options.index);

    return element instanceof Array || element === undefined
      ? element
      : [element];
  }
}
