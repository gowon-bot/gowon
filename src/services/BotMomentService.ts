import regexEscape from "escape-string-regexp";
import { RunAs } from "../lib/AliasChecker";

export class BotMomentService {
  // Static methods/properties
  private static instance: BotMomentService;

  private constructor() {}

  static getInstance(): BotMomentService {
    if (!this.instance) {
      this.instance = new BotMomentService();
    }
    return this.instance;
  }

  // Instance methods/properties
  prefix: string = "!";
  customPrefixes = {
    lastfm: "lastfm:",
  };

  get regexSafePrefix(): string {
    return regexEscape(this.prefix);
  }

  removeCommandName(string: string, runAs: RunAs): string {
    return string.replace(
      new RegExp(`${this.regexSafePrefix}${runAs.toRegexString()}`, "i"),
      ""
    );
  }
}
