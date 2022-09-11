import { CommandInteraction, Message } from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { EmojiMention, EmojiParser } from "../../parsers/EmojiParser";
import { GowonContext } from "../../../Context";
import {
  BaseArgument,
  BaseArgumentOptions,
  defaultIndexableOptions,
  SliceableArgumentOptions,
} from "../BaseArgument";
import { SlashCommandBuilder } from "@discordjs/builders";

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

  constructor(options: OptionsT | {} = {}) {
    super(defaultIndexableOptions, { parse: "all" }, options);
  }

  parseFromMessage(
    _: Message,
    content: string,
    ctx: GowonContext
  ): EmojiMention[] | undefined {
    const cleanContent = this.cleanContent(ctx, content);

    return this.parseFromString(cleanContent) || this.options.default;
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

  private parseFromString(string: string): EmojiMention[] {
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
