import { EmojiMention } from "../../lib/context/arguments/parsers/EmojiParser";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";

interface EmojiValidation {
  valid: EmojiMention[];
  invalid: EmojiMention[];
}

export class EmojiService extends BaseService {
  validateEmojis(ctx: GowonContext, emojis: EmojiMention[]): EmojiValidation {
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

  validateEmoji(ctx: GowonContext, emoji: EmojiMention): boolean {
    return ctx.client.client.emojis.cache.has(emoji.resolvable);
  }

  uniquifyEmojis(emojis: EmojiMention[]): EmojiMention[] {
    return emojis.filter((value, index, self) => {
      return self.map((e) => e.resolvable).indexOf(value.resolvable) === index;
    });
  }
}
