import { ArgumentsMap } from "../context/arguments/types";
import { BaseCommand } from "./BaseCommand";
import { Command } from "./Command";
import { CommandGroup } from "./CommandGroup";

export abstract class ParentCommand extends BaseCommand {
  abstract children: CommandGroup;
  hasChildren = true;
  default?: () => Command;
  prefixes: string | Array<string> = "";

  // A list of aliases that can "bypass" the parent prefix
  // eg, if you had crownsparentcommand, and put `c` in this array,
  // both `!c` and `!crowns c` would work.
  // Formerly `canSkipPrefixFor`
  noPrefixAliases: Array<string> = [];

  async getChild(
    child: string,
    serverID: string
  ): Promise<Command | undefined> {
    let childCommand = await this.commandRegistry.find(
      child,
      serverID,
      this.children.commands
    );

    if (childCommand.command) {
      return childCommand.command;
    }
    return;
  }

  async execute() {}

  async run() {}
}

export abstract class ChildCommand<
  T extends ArgumentsMap = {}
> extends BaseCommand<T> {
  shouldBeIndexed = false;
  abstract parentName: string;
}
