import { BaseMention } from "./BaseMention";

export class DiscordIDMention extends BaseMention {
  prefix = ["", "id:"];
  mentionRegex = "[0-9]{17,18}";
}
