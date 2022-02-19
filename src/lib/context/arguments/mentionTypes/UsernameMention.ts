import { BaseMention } from "./BaseMention";

export class DiscordUsernameMention extends BaseMention {
  prefix = ["u:", "username:"];
  mentionRegex = ".*";
}
