import emojiRegexFunction from "emoji-regex";
import { extractEmojiID } from "../../Emoji";

export interface EmojiMention {
  raw: string;
  resolvable: string;
  type: "animated" | "custom" | "unicode";
}

const animatedRegex = /<a:[\w-]+:\d{18}>/g;
const customRegex = /<:[\w-]+:\d{18}>/g;
const emojiRegex = emojiRegexFunction();

export function isUnicodeEmoji(value: string): boolean {
  return emojiRegex.test(value);
}

export class EmojiParser {
  constructor(private rawString: string) {}

  parseAll(): EmojiMention[] {
    return this.parseAnimatedEmotes()
      .concat(this.parseCustomEmotes())
      .concat(this.parseDefaultEmotes());
  }

  parseAnimatedEmotes(): EmojiMention[] {
    const matches = this.rawString.matchAll(animatedRegex);
    const mentions = [] as EmojiMention[];

    for (const match of matches) {
      const matchString = match.shift();

      if (!matchString) continue;

      mentions.push({
        raw: matchString,
        resolvable: extractEmojiID(matchString),
        type: "animated",
      });
    }

    return mentions;
  }

  parseCustomEmotes(): EmojiMention[] {
    const matches = this.rawString.matchAll(customRegex);
    const mentions = [] as EmojiMention[];

    for (const match of matches) {
      const matchString = match.shift();

      if (!matchString) continue;

      mentions.push({
        raw: matchString,
        resolvable: extractEmojiID(matchString),
        type: "custom",
      });
    }

    return mentions;
  }

  parseDefaultEmotes(): EmojiMention[] {
    const matches = this.rawString.matchAll(emojiRegex);
    const mentions = [] as EmojiMention[];

    for (const match of matches) {
      const matchString = match.shift();

      if (!matchString) continue;

      mentions.push({
        raw: matchString,
        resolvable: matchString,
        type: "unicode",
      });
    }

    return mentions;
  }
}

export function removeEmojisFromString(string: string): string {
  return string
    .replaceAll(animatedRegex, "")
    .replaceAll(customRegex, "")
    .replaceAll(emojiRegex, "");
}
