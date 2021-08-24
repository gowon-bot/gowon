import { Arguments } from "../arguments/arguments";
import { BaseCommand } from "./BaseCommand";
import { Command } from "./Command";
import { CommandManager } from "./CommandManager";

export abstract class ParentCommand extends BaseCommand {
  abstract children: CommandManager;
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
    let childCommand = await this.children.find(child, serverID);

    if (childCommand.command) {
      return childCommand.command;
    }
    return;
  }

  async execute() {}

  async run() {}
}

export abstract class ChildCommand<
  T extends Arguments = Arguments
> extends BaseCommand<T> {
  shouldBeIndexed = false;
  abstract parentName: string;
}
