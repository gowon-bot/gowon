import { EmojiMention } from "../../lib/arguments/custom/EmojiParser";
import { BaseService, BaseServiceContext } from "../BaseService";

interface EmojiValidation {
  valid: EmojiMention[];
  invalid: EmojiMention[];
}

export class EmojiService extends BaseService {
  validateEmojis(
    ctx: BaseServiceContext,
    emojis: EmojiMention[]
  ): EmojiValidation {
    const uniquified = this.uniquifyEmojis(emojis);

    const valid: EmojiMention[] = [];
    const invalid: EmojiMention[] = [];

    for (const emoji of uniquified) {
      if (emoji.type === "unicode" || this.validateEmoji(ctx, emoji)) {
        valid.push(emoji);
      } else {
        invalid.push(emoji);
      }
    }

    return { valid, invalid };
  }

  validateEmoji(ctx: BaseServiceContext, emoji: EmojiMention): boolean {
    return ctx.client.client.emojis.cache.has(emoji.resolvable);
  }

  uniquifyEmojis(emojis: EmojiMention[]): EmojiMention[] {
    return emojis.filter((value, index, self) => {
      return self.map((e) => e.resolvable).indexOf(value.resolvable) === index;
    });
  }
}
