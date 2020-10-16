import { BaseCommand } from "./BaseCommand";
import { Command } from "./Command";
import { CommandManager } from "./CommandManager";

export abstract class ParentCommand extends BaseCommand {
  abstract children: CommandManager;
  hasChildren = true;
  default?: () => Command;
  prefixes: string | Array<string> = "";
  canSkipPrefixFor: Array<string> = [];

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

export abstract class ChildCommand extends BaseCommand {
  shouldBeIndexed = false;
  abstract parentName: string;
}
