import { Command } from "./command/Command";
import escapeStringRegexp from "escape-string-regexp";
import { GowonService } from "../services/GowonService";
import { ParentCommand } from "./command/ParentCommand";

class Stack {
  next?: Stack;

  constructor(public string: string, public command: Command) {}
}

export class RunAs {
  stack?: Stack;

  constructor() {}

  empty(): boolean {
    return !this.stack;
  }

  last(): Stack | undefined {
    let s = this.stack;

    while (s) {
      if (s.next) {
        s = s.next;
        continue;
      }

      return s;
    }

    return undefined;
  }

  lastString(): string {
    return this.last()?.string || "";
  }

  toCommandArray(): Array<Command> {
    let array: Array<Command> = [];

    let s = this.stack;

    while (s) {
      array.push(s.command);
      s = s.next;
    }

    return array;
  }

  toCommandFriendlyName(): string {
    return this.toCommandArray()
      .map((c) => c.friendlyName)
      .join(" ");
  }

  toArray(): Array<string> {
    let array: Array<string> = [];

    let s = this.stack;

    while (s) {
      array.push(s.string);
      s = s.next;
    }

    return array;
  }

  toRegexString(): string {
    return this.toArray()
      .map((s) => escapeStringRegexp(s))
      .join("\\s+");
  }

  add(stack: { string: string; command: Command }): RunAs {
    let s = this.stack;

    while (s) {
      if (s.next) {
        s = s.next;
        continue;
      }

      s.next = stack;
      return this;
    }

    this.stack = new Stack(stack.string, stack.command);
    return this;
  }

  variationWasUsed(...variations: string[]): boolean {
    for (let variation of variations) {
      if (this.lastString().toLowerCase() === variation) return true;
    }
    return false;
  }
}

export class AliasChecker {
  private gowonService = GowonService.getInstance();

  constructor(private aliasesString: string) {}

  async parentCommandGetChildSkipPrefix(
    command: ParentCommand,
    childAlias: string,
    serverID: string
  ): Promise<Command | undefined> {
    let child = await command.children.find(childAlias, serverID);

    if (
      child.command &&
      command.canSkipPrefixFor.includes(child.command.name) &&
      childAlias !== child.command.name
    )
      return child.command;

    return undefined;
  }

  parentCommandHasAlias(command: ParentCommand, alias: string): boolean {
    return typeof command.prefixes === "string"
      ? command.prefixes.toLowerCase().trim() === alias.trim().toLowerCase()
      : command.prefixes.map((p) => p.toLowerCase().trim()).includes(alias);
  }

  commandHasAlias(command: Command, alias: string): boolean {
    if (command instanceof ParentCommand) {
      return this.parentCommandHasAlias(command, alias);
    } else
      return (
        command.name.toLowerCase() === alias.toLowerCase() ||
        command.aliases
          .map((a) => a.toLowerCase())
          .includes(alias.toLowerCase())
      );
  }

  commandHasVariation(command: Command, variation: string): boolean {
    for (let v of command.variations) {
      if (v.variationString) {
        if (v.variationString.toLowerCase() === variation.toLowerCase())
          return true;
      } else if (v.variationRegex) {
        if (v.variationRegex.test(variation)) return true;
      }
    }
    return false;
  }

  async getRunAs(command: Command, serverID: string): Promise<RunAs> {
    let checks = this.aliasesString
      .toLowerCase()
      .replace(
        new RegExp(await this.gowonService.regexSafePrefix(serverID), "i"),
        ""
      )
      .trim()
      .split(/\s+/);

    let runAs = new RunAs();

    let parent: { command?: ParentCommand; atIndex?: number } = {};

    for (let check_i = 0; check_i < checks.length; check_i++) {
      const check = checks[check_i];

      if (command instanceof ParentCommand) {
        if (this.parentCommandHasAlias(command, check)) {
          parent = {
            command,
            atIndex: check_i,
          };
        }

        if (
          parent.command &&
          parent.atIndex &&
          parent.atIndex + 1 === check_i
        ) {
          return runAs.add({
            string: checks[parent.atIndex],
            command: parent.command,
          });
        }

        let child = await command.getChild(
          checks.slice(check_i + 1).join(" ") || "",
          serverID
        );
        let childNoPrefix = await this.parentCommandGetChildSkipPrefix(
          command,
          check,
          serverID
        );

        if (childNoPrefix)
          return runAs.add({ string: check, command: childNoPrefix });

        if (child && this.parentCommandHasAlias(command, check)) {
          runAs.add({ command, string: check });
          command = child;
        } else break;
      } else {
        if (
          (this.commandHasAlias(command, check) ||
            this.commandHasVariation(command, check)) &&
          command
        ) {
          return runAs.add({ command, string: check });
        } else break;
      }
    }

    if (parent.command && typeof parent.atIndex === "number")
      return runAs.add({
        string: checks[parent.atIndex],
        command: parent.command,
      });

    return runAs;
  }

  async check(command: Command, serverID: string): Promise<boolean> {
    return !(await this.getRunAs(command, serverID)).empty();
  }
}
