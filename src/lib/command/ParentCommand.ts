import { BaseCommand, Command } from "./BaseCommand";
import escapeStringRegexp from "escape-string-regexp";

export abstract class ParentCommand extends BaseCommand {
  children: ChildCommand[] = [];
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
    return (
      this.children.find(
        (c) => c.name === adjustedName || c.hasAlias(adjustedName)
      ) || this.default
    );
  }

  async run() {}
}

export abstract class ChildCommand extends BaseCommand {
  shouldBeIndexed = false;
  abstract parent: typeof ParentCommand;
}
