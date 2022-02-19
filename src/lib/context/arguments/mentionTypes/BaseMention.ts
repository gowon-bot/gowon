import escapeStringRegexp from "escape-string-regexp";

export interface Mention {
  parse(string: string): string[];
  removeFrom(string: string): string;
  ndmpOnly: boolean;
}

export abstract class BaseMention {
  abstract prefix: string | string[];
  abstract mentionRegex: string;

  constructor() {}

  parse(string: string): string[] {
    return Array.from(string.match(this.buildParseRegex()) || []).map((m) =>
      m.trim()
    );
  }

  removeFrom(string: string): string {
    return string.replace(this.buildRemoveRegex(), "");
  }

  private buildPrefix(): string {
    return this.prefix instanceof Array
      ? this.prefix.map((p) => escapeStringRegexp(p)).join("|")
      : escapeStringRegexp(this.prefix);
  }

  private buildParseRegex(): RegExp {
    let prefix = this.buildPrefix();

    return new RegExp(`(?<=\\b${prefix})\\s*${this.mentionRegex}`, "gi");
  }

  private buildRemoveRegex(): RegExp {
    let prefix = this.buildPrefix();

    return new RegExp(`\\b(${prefix})\\s*${this.mentionRegex}`, "gi");
  }
}
