import emojiRegexFunction from "emoji-regex";
import { flatDeep } from "../../../../helpers";
import { extractEmojiID } from "../../../emoji/Emoji";

type EmojiType = "animated" | "static" | "unicode";

export interface EmojiMention {
  raw: string;
  resolvable: string;
  type: EmojiType;
}

const animatedRegex = /<a:[\w-]+:\d{18,}>/g;
const staticRegex = /<:[\w-]+:\d{18,}>/g;
const unicodeEmojiRegex = new RegExp(
  `((${emojiRegexFunction().source})|([\uD83C][\uDDE6-\uDDFF]))`,
  "g"
);

const emojiRegex = new RegExp(
  `.*(${staticRegex.source})|(${animatedRegex.source})|(${unicodeEmojiRegex.source}).*`,
  "g"
);

export function isUnicodeEmoji(value: string): boolean {
  return unicodeEmojiRegex.test(value);
}

export class EmojiParser {
  parse(rawString: string): EmojiMention[] {
    const split = rawString.split(/\s+/);

    const allEmojis = split.map((s) => this.parseEmojisFromSplit(s));

    return flatDeep(allEmojis);
  }

  private parseEmojisFromSplit(split: string): EmojiMention[] {
    const matches = split.matchAll(emojiRegex);
    const mentions = [] as EmojiMention[];

    for (const match of matches) {
      const matchString = match.shift();

      if (!matchString) continue;

      const type = this.getEmojiType(matchString);

      if (type === "animated" || type == "static") {
        mentions.push({
          raw: matchString,
          resolvable: extractEmojiID(matchString),
          type,
        });
      } else {
        mentions.push({
          raw: matchString,
          resolvable: matchString,
          type,
        });
      }
    }

    return mentions;
  }

  private getEmojiType(emoji: string): EmojiType {
    if (emoji.match(animatedRegex)) return "animated";
    if (emoji.match(staticRegex)) return "static";
    else return "unicode";
  }

  static removeEmojisFromString(string: string): string {
    return string
      .replaceAll(animatedRegex, "")
      .replaceAll(staticRegex, "")
      .replaceAll(emojiRegex, "");
  }
}
