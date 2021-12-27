import emojiRegexFunction from "emoji-regex";
import { extractEmojiID } from "../../../Emoji";

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
  parseAll(rawString: string): EmojiMention[] {
    return this.parseAnimatedEmotes(rawString)
      .concat(this.parseCustomEmotes(rawString))
      .concat(this.parseDefaultEmotes(rawString));
  }

  parseAnimatedEmotes(rawString: string): EmojiMention[] {
    const matches = rawString.matchAll(animatedRegex);
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

  parseCustomEmotes(rawString: string): EmojiMention[] {
    const matches = rawString.matchAll(customRegex);
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

  parseDefaultEmotes(rawString: string): EmojiMention[] {
    const matches = rawString.matchAll(emojiRegex);
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
