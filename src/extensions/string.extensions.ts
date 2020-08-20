import { sanitizeForDiscord } from "../helpers/discord";

declare global {
  interface String {
    italic: () => string;
    bold: () => string;
    code: () => string;
    toInt: () => number;
  }
}

String.prototype.italic = function (this: string): string {
  return "_" + sanitizeForDiscord(this) + "_";
};

String.prototype.bold = function (this: string): string {
  return "**" + sanitizeForDiscord(this) + "**";
};

String.prototype.code = function (this: string): string {
  return "`" + this + "`";
};

String.prototype.toInt = function (this: string): number {
  return parseInt(this.replace(/,/g, ""), 10);
};
