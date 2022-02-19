import { BaseMention } from "./BaseMention";

export class DiscordIDMention extends BaseMention {
  prefix = ["", "id:"];
  mentionRegex = "(?<=\\s|^)[0-9]{17,18}(?=\\s|$)";
}
