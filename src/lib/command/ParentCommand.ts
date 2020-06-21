import { BaseCommand, Command, NoCommand } from "./BaseCommand";
import escapeStringRegexp from "escape-string-regexp";
import { CommandManager } from "./CommandManager";

export abstract class ParentCommand extends BaseCommand {
  abstract children: CommandManager;
  default?: Command;
  prefix: string = "";

  getChild(name: string): Command | undefined {
    let adjustedName = name;
    if (name.startsWith(this.prefix)) {
      adjustedName = name.replace(
        new RegExp(escapeStringRegexp(this.prefix)),
        ""
      );
    }
    let child = this.children.find(adjustedName);

    return child instanceof NoCommand ? undefined : child
  }

  async run() {}
}

export abstract class ChildCommand extends BaseCommand {
  shouldBeIndexed = false;
}
