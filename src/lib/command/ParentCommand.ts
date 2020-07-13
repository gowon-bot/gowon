import { BaseCommand, Command, NoCommand } from "./BaseCommand";
import { CommandManager } from "./CommandManager";

export abstract class ParentCommand extends BaseCommand {
  abstract children: CommandManager;
  hasChildren = true;
  default?: () => Command;
  prefixes: string | Array<string> = "";
  canSkipPrefixFor: Array<string> = [];

  getChild(child: string): Command | undefined {
    let childCommand = this.children.find(child);

    if (!(childCommand.command instanceof NoCommand)) {
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
