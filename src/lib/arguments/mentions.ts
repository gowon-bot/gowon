import { User, Message } from "discord.js";
import { ArgumentParser, ParsedArguments, Slice } from "./arguments";
import { Parser } from "./parser";
import escapeStringRegexp from "escape-string-regexp";

export interface MentionOptions {
  index: number | Slice;
  description?: string;
  nonDiscordMentionParsing?: {
    prefix: string;
  };
}

export type Mention = User | string;

export class MentionParser extends Parser {
  argumentsParser: ArgumentParser;

  constructor(argumentsParser: ArgumentParser) {
    super();
    this.argumentsParser = argumentsParser;
  }

  private buildCustomMentionRegex(prefix: string): RegExp {
    return new RegExp(`(?<=\\b${escapeStringRegexp(prefix)})\\w+`, "gi");
  }

  hasNonDiscordMentions(): boolean {
    for (let mentionOptions of Object.values(
      this.argumentsParser.arguments?.mentions ?? {}
    )) {
      if (!!mentionOptions.nonDiscordMentionParsing) return true;
    }
    return false;
  }

  removeCustomMentions(string: string): string {
    let prefixRegexPart = Object.values(
      this.argumentsParser.arguments.mentions || {}
    )
      .filter((mo) => !!mo.nonDiscordMentionParsing?.prefix)
      .map((mo) => escapeStringRegexp(mo.nonDiscordMentionParsing?.prefix!))
      .join("|");

    return string.replace(new RegExp(`\\b(${prefixRegexPart})\\w+`, "gi"), "");
  }

  private parseMention(
    mentionOptions: MentionOptions,
    message: Message
  ): Mention | undefined {
    if (mentionOptions.nonDiscordMentionParsing) {
      let matches =
        message.content.match(
          this.buildCustomMentionRegex(
            mentionOptions.nonDiscordMentionParsing.prefix
          )
        ) || [];

      if (!matches.length)
        return this.getElementFromIndex(
          message.mentions.users.array(),
          mentionOptions.index
        );

      return this.getElementFromIndex(matches, mentionOptions.index);
    } else
      return this.getElementFromIndex(
        message.mentions.users.array(),
        mentionOptions.index
      );
  }

  parse(message: Message): ParsedArguments {
    let mentions = this.argumentsParser.arguments.mentions;

    if (mentions) {
      return Object.keys(mentions).reduce((acc, arg) => {
        let mentionOptions = mentions![arg];
        if (mentionOptions) {
          acc[arg] = this.parseMention(mentionOptions, message);
        }
        return acc;
      }, {} as ParsedArguments);
    } else return {};
  }
}
