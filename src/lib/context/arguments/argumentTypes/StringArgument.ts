import { Message } from "discord.js";
import escapeStringRegexp from "escape-string-regexp";
import { GowonService } from "../../../../services/GowonService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { GowonContext } from "../../Context";
import {
  BaseArgument,
  defaultIndexableOptions,
  SliceableArgumentOptions,
} from "./BaseArgument";

export interface StringArgumentOptions extends SliceableArgumentOptions {
  splitOn: string;
  match: string[];
  regex: RegExp;
}

export class StringArgument extends BaseArgument<
  string,
  StringArgumentOptions
> {
  get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  constructor(options: Partial<StringArgumentOptions> = {}) {
    super(defaultIndexableOptions, { splitOn: " ", match: [] }, options);
  }

  parseFromMessage(_: Message, content: string, context: GowonContext): string {
    const cleanContent = this.gowonService.removeCommandName(
      content,
      context.runAs,
      context.guild.id
    );

    if (this.options.match.length) {
      const regex = new RegExp(
        `(?:\\b|$)${this.options.match
          .map((m) => escapeStringRegexp(m))
          .join("|")}(?:\\b|^)`,
        "gi"
      );

      return this.parseFromRegex(content, regex);
    } else if (this.options.regex) {
      return this.parseFromRegex(content, this.options.regex);
    } else {
      const splitContent = cleanContent.split(this.options.splitOn);

      return this.getElementFromIndex(splitContent, this.options.index, {
        join: true,
      });
    }
  }

  parseFromInteraction() {
    return "";
  }

  private parseFromRegex(content: string, regex: RegExp): string {
    const matches = Array.from(content.matchAll(regex) || []);

    const match = this.getElementFromIndex(matches, this.options.index);

    if (match && typeof match[0] === "string") {
      return match[0];
    } else return "";
  }
}
