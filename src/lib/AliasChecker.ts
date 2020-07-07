import { Command, NoCommand } from "./command/BaseCommand";
import escapeStringRegexp from "escape-string-regexp";
import { BotMomentService } from "../services/BotMomentService";
import { ParentCommand } from "./command/ParentCommand";

class Stack {
  string: string;
  command: Command;
  next?: Stack;

  constructor(runAs: string, command: Command) {
    this.command = command;
    this.string = runAs;
  }
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
}

export class AliasChecker {
  private aliasesString: string;
  private botMomentService = BotMomentService.getInstance();

  constructor(aliasesString: string) {
    this.aliasesString = aliasesString;
  }

  parentCommandGetChildSkipPrefix(
    command: ParentCommand,
    childAlias: string
  ): Command | undefined {
    let child = command.children.find(childAlias);

    if (
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
        return v.variationString.toLowerCase() === variation.toLowerCase();
      } else if (v.variationRegex) {
        return v.variationRegex.test(variation);
      }
    }
    return false;
  }

  getRunAs(command: Command): RunAs {
    let checks = this.aliasesString
      .toLowerCase()
      .replace(new RegExp(this.botMomentService.regexSafePrefix, "i"), "")
      .trim()
      .split(/\s+/);

    let runAs = new RunAs();

    for (let check_i = 0; check_i < checks.length; check_i++) {
      const check = checks[check_i];

      if (command instanceof ParentCommand) {
        if (
          check_i === checks.length - 1 &&
          this.parentCommandHasAlias(command, check)
        ) {
          return runAs.add({ string: check, command: command });
        }

        let child = command.getChild(checks.slice(check_i + 1).join(" ") || "");
        let childNoPrefix = this.parentCommandGetChildSkipPrefix(
          command,
          check
        );

        if (childNoPrefix)
          return runAs.add({ string: check, command: childNoPrefix });

        if (
          child &&
          !(child instanceof NoCommand) &&
          this.parentCommandHasAlias(command, check)
        ) {
          runAs.add({ command, string: check });
          command = child;
        } else break;
      } else {
        if (
          (this.commandHasAlias(command, check) ||
            this.commandHasVariation(command, check)) &&
          !(command instanceof NoCommand)
        ) {
          return runAs.add({ command, string: check });
        } else break;
      }
    }

    return runAs;
  }

  check(command: Command): boolean {
    return !this.getRunAs(command).empty();
  }
}
