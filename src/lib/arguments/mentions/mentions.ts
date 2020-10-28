import { User, Message } from "discord.js";
import { ArgumentParser, ParsedArguments, Slice } from "../arguments";
import { Parser } from "../parser";
import { Mention } from "./BaseMention";
import { DiscordIDMention } from "./DiscordIDMention";
import { LastFMMention } from "./LastFMMention";

export interface MentionOptions {
  index: number | Slice;
  description?: string;
  join?: boolean;
  mention?: Mention;
  ndmpOnly?: boolean;
}

export type ParsedMention = User | string;

export const standardMentions = {
  user: { index: 0 },
  userID: { mention: new DiscordIDMention(true), index: 0 },
  lfmUser: { mention: new LastFMMention(true), index: 0 },
} as const;

export class MentionParser extends Parser {
  constructor(private argumentsParser: ArgumentParser) {
    super();
  }

  parse(message: Message): ParsedArguments {
    let mentions = this.argumentsParser.args.mentions;

    if (mentions) {
      return Object.entries(mentions).reduce((acc, [arg, mentionOptions]) => {
        if (mentionOptions) {
          acc[arg] = this.parseMention(mentionOptions, message);
        }
        return acc;
      }, {} as ParsedArguments);
    } else return {};
  }

  hasNonDiscordMentions(): boolean {
    for (let mentionOptions of Object.values(
      this.argumentsParser.args?.mentions ?? {}
    )) {
      if (!!mentionOptions.mention) return true;
    }
    return false;
  }

  removeCustomMentions(string: string): string {
    let mentions = Object.values(
      this.argumentsParser.args.mentions || {}
    ).filter((mo) => !!mo.mention);

    return mentions.reduce((acc, mention) => {
      return mention.mention!.removeFrom(acc);
    }, string);
  }

  private parseMention(
    mentionOptions: MentionOptions,
    message: Message
  ): ParsedMention | ParsedMention[] | undefined {
    if (mentionOptions.mention) {
      let matches = mentionOptions.mention.parse(message.content);

      if (!matches.length) {
        if (mentionOptions.mention.ndmpOnly) {
          return undefined;
        } else {
          return this.getElementFromIndex(
            message.mentions.users.array(),
            mentionOptions.index,
            { join: mentionOptions.join }
          );
        }
      }

      return this.getElementFromIndex(matches, mentionOptions.index, {
        join: mentionOptions.join,
      });
    } else
      return this.getElementFromIndex(
        message.mentions.users.array(),
        mentionOptions.index,
        { join: mentionOptions.join }
      );
  }
}
