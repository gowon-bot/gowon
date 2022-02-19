import { Message } from "discord.js";
import { FlagOptions, FlagParser } from "../parsers/FlagParser";
import { BaseArgument, StringCleaningArgument } from "./BaseArgument";

export interface FlagArgumentOptions extends FlagOptions {}

export class Flag
  extends BaseArgument<boolean, FlagArgumentOptions>
  implements StringCleaningArgument
{
  private flagParser = new FlagParser();

  constructor(options: Partial<FlagArgumentOptions> = {}) {
    super({ shortnames: [], longnames: [], description: "" }, options);
  }

  parseFromMessage(_: Message, content: string): boolean {
    return this.flagParser.parse(this.options, content);
  }

  parseFromInteraction(): boolean {
    return false;
  }

  public clean(string: string): string {
    return this.flagParser.clean(this.options, string);
  }
}

export function isFlag(argument: BaseArgument<any>): argument is Flag {
  return argument instanceof Flag;
}
