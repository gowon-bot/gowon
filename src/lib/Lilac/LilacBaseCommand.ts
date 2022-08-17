import { Command } from "../command/Command";
import { ArgumentsMap } from "../context/arguments/types";

export abstract class LilacBaseCommand<
  T extends ArgumentsMap = {}
> extends Command<T> {
  protected readonly progressBarWidth = 15;

  readonly indexingHelp =
    '"Indexing" means downloading all your last.fm data. This is required for many commands to function.';
}
