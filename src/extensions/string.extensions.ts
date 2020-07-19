import { sanitizeForDiscord } from "../helpers/discord";

declare global {
  interface String {
    italic: () => string;
    bold: () => string;
    code: () => string;
  }
}
String.prototype.italic = function (this: string) {
  return "_" + sanitizeForDiscord(this) + "_";
};

String.prototype.bold = function (this: string) {
  return "**" + sanitizeForDiscord(this) + "**";
};

String.prototype.code = function (this: string) {
  return "`" + this + "`";
};
