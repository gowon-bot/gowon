import { Message } from "discord.js";
import { GowonService } from "../../../../../services/GowonService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { EmojiMention, EmojiParser } from "../../parsers/EmojiParser";
import { GowonContext } from "../../../Context";
import {
  BaseArgument,
  defaultIndexableOptions,
  SliceableArgumentOptions,
} from "../BaseArgument";

export interface EmojisArgumentOptions extends SliceableArgumentOptions {
  parse: "all" | "default" | "custom" | "animated";
}

export class EmojisArgument extends BaseArgument<
  EmojiMention[],
  EmojisArgumentOptions
> {
  private emojiParser = new EmojiParser();

  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(options: Partial<EmojisArgumentOptions> = {}) {
    super(defaultIndexableOptions, { parse: "all" }, options);
  }

  parseFromMessage(
    _: Message,
    content: string,
    context: GowonContext
  ): EmojiMention[] {
    const cleanContent = this.gowonService.removeCommandName(
      content,
      context.runAs,
      context.guild.id
    );

    let emojis: EmojiMention[] = [];

    switch (this.options.parse) {
      case "all":
        emojis = this.emojiParser.parseAll(cleanContent);
        break;
      case "default":
        emojis = this.emojiParser.parseDefaultEmotes(cleanContent);
        break;
      case "animated":
        emojis = this.emojiParser.parseAnimatedEmotes(cleanContent);
        break;
      case "custom":
        emojis = this.emojiParser.parseCustomEmotes(cleanContent);
        break;
    }

    return this.getElementFromIndex(emojis, this.options.index);
  }

  parseFromInteraction() {
    return [];
  }
}
