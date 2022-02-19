import { Message } from "discord.js";
import { BaseMention } from "../mentionTypes/BaseMention";
import {
  BaseArgument,
  defaultIndexableOptions,
  IndexableArgumentOptions,
  StringCleaningArgument,
} from "./BaseArgument";

export interface UserStringArgumentOptions extends IndexableArgumentOptions {
  mention: BaseMention;
}

export class UserStringArgument
  extends BaseArgument<string, UserStringArgumentOptions>
  implements StringCleaningArgument
{
  mention = true;

  constructor(options: Partial<UserStringArgumentOptions> = {}) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(_: Message, content: string): string {
    const mentions = this.options.mention.parse(content);

    return this.getElementFromIndex(mentions, this.options.index);
  }

  parseFromInteraction() {
    return "";
  }

  public clean(string: string) {
    return this.options.mention.removeFrom(string);
  }
}
