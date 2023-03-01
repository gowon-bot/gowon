import { Message } from "discord.js";
import { BaseMention } from "../mentionTypes/BaseMention";
import {
  BaseArgument,
  BaseArgumentOptions,
  defaultIndexableOptions,
  SliceableArgumentOptions,
  StringCleaningArgument,
} from "./BaseArgument";

export interface UserStringArrayArgumentOptions
  extends BaseArgumentOptions,
    SliceableArgumentOptions {
  mention: BaseMention;
}

export class UserStringArrayArgument<
    OptionsT extends Partial<UserStringArrayArgumentOptions>
  >
  extends BaseArgument<string[], UserStringArrayArgumentOptions, OptionsT>
  implements StringCleaningArgument
{
  mention = true;

  constructor(options?: OptionsT) {
    super(defaultIndexableOptions, options);
  }

  parseFromMessage(_: Message, content: string): string[] {
    const mentions = this.options.mention.parse(content);

    return this.getElementFromIndex(mentions, this.options.index);
  }

  parseFromInteraction() {
    return [];
  }

  public clean(string: string) {
    return this.options.mention.removeFrom(string);
  }
}
