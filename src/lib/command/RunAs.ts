import escapeStringRegexp from "escape-string-regexp";
import { BaseCommand } from "./BaseCommand";

class Stack {
  next?: Stack;

  constructor(public string: string, public command: BaseCommand) {}
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

  toCommandArray(): Array<BaseCommand> {
    let array: Array<BaseCommand> = [];

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

  add(stack: { string: string; command: BaseCommand }): RunAs {
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
