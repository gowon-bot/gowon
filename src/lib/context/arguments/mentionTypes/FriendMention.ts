import { BaseMention } from "./BaseMention";

export class FriendAliasMention extends BaseMention {
  prefix = ["f:", "friend:"];
  mentionRegex = "[^\\s]*";
}
