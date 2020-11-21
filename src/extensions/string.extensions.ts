import { sanitizeForDiscord } from "../helpers/discord";

type FormattingFunction = (sanitize?: boolean) => string;

declare global {
  interface String {
    italic: FormattingFunction;
    strong: FormattingFunction;
    code: () => string;
    toInt: () => number;
  }
}

String.prototype.italic = function (
  this: string,
  sanitize: boolean = true
): string {
  return "_" + (sanitize ? sanitizeForDiscord(this) : this) + "_";
};

String.prototype.strong = function (
  this: string,
  sanitize: boolean = true
): string {
  return "**" + (sanitize ? sanitizeForDiscord(this) : this) + "**";
};

String.prototype.code = function (this: string): string {
  return "`" + this + "`";
};

String.prototype.toInt = function (this: string): number {
  return parseInt(this.replace(/,/g, ""), 10);
};
