import { BaseMention } from "./BaseMention";

export class LastFMMention extends BaseMention {
  prefix = ["lfm:", "lastfm:"];
  mentionRegex = "[\\w\\-.!]+";
}
