import { ArgumentsMap } from "../context/arguments/types";
import { Command } from "./Command";
import { ChildCommand } from "./ChildCommand";
import { CommandGroup } from "./CommandGroup";

export abstract class ParentCommand extends Command {
  abstract children: CommandGroup;
  hasChildren = true;
  default?: () => Command;
  prefixes: string | Array<string> = "";

  /* A list of aliases that can "bypass" the parent prefix
   eg, if you had crownsparentcommand, and put `c` in this array,
   both `!c` and `!crowns c` would work.
   Formerly `canSkipPrefixFor`
  */
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

export abstract class BaseChildCommand<T extends ArgumentsMap = {}>
  extends Command<T>
  implements ChildCommand<T>
{
  shouldBeIndexed = false;
  abstract parentName: string;
  parentID!: string;
  isChild = true;
}
