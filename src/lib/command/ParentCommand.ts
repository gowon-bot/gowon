import { BaseCommand, Command, NoCommand } from "./BaseCommand";
import { CommandManager } from "./CommandManager";
import { Message } from "discord.js";

export abstract class ParentCommand extends BaseCommand {
  abstract children: CommandManager;
  default?: () => Command;
  prefixes: string | Array<string> = "";
  canSkipPrefixFor: Array<string> = [];

  private skippedPrefix: boolean = false;

  getChild(alias: string): Command {
    return this.children.find(alias);
  }

  getPrefix(prefix: string): string | undefined {
    return typeof this.prefixes === "string"
      ? this.prefixes
      : this.prefixes.find(
          (p) => p.trim().toLowerCase() === prefix.trim().toLowerCase()
        );
  }

  async execute(message: Message, runAs: string) {
    let alias = this.skippedPrefix
      ? runAs
      : this.botMomentService
          .removeCommandName(message.content, runAs)
          .trim()
          .split(/\s+/)[0];

    let child = this.getChild(alias);

    let newRunAs = this.skippedPrefix ? alias : this.getPrefix(runAs) + alias;

    if (!(child instanceof NoCommand)) {
      await child.execute(message, newRunAs);
    } else if (this.default) {
      await this.default().execute(message, runAs.trim());
    }
  }

  async run() {}

  hasAlias(alias: string): boolean {
    let child = this.children.find(alias);

    if (!this.prefixes) return !(child instanceof NoCommand);
    else if (
      this.canSkipPrefixFor.length &&
      this.canSkipPrefixFor.includes(child.name.toLowerCase())
    ) {
      this.skippedPrefix = true;
      return true;
    } else {
      return typeof this.prefixes === "string"
        ? this.prefixes.trim().toLowerCase() === alias
        : this.prefixes.map((p) => p.trim().toLowerCase()).includes(alias);
    }
  }
}

export abstract class ChildCommand extends BaseCommand {
  shouldBeIndexed = false;
  abstract parentName: string;
}
