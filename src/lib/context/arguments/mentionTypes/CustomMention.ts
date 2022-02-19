import { BaseMention } from "./BaseMention";

export class CustomMention extends BaseMention {
  constructor(public prefix: string, public mentionRegex: string) {
    super();
  }
}
