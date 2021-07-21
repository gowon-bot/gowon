import { BaseMention } from "./BaseMention";

export class UsernameMention extends BaseMention {
  prefix = ["u:", "username:"];
  mentionRegex = ".*";
}
