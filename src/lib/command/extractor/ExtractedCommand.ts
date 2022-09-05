import escapeStringRegexp from "escape-string-regexp";
import { Command } from "../Command";

export class ExtractedCommand {
  constructor(public commandStack: { command: Command; matched: string }[]) {}

  public empty(): boolean {
    return !!this.commandStack.length;
  }

  public asRemovalRegexString(): string {
    return this.commandStack
      .filter(({ matched }) => !!matched)
      .map(({ matched: m }) => escapeStringRegexp(m))
      .join("\\s+");
  }

  get command(): Command {
    return this.commandStack[this.commandStack.length - 1].command;
  }

  get matched(): string {
    return this.commandStack[this.commandStack.length - 1].matched;
  }

  public add(stack: { command: Command; matched: string }) {
    this.commandStack.push(stack);
  }

  public didMatch(...variations: string[]): boolean {
    return variations.some(
      (variation) => this.matched.toLowerCase() === variation
    );
  }
}
