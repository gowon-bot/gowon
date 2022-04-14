import { GowonService } from "../services/GowonService";
import { RunAs } from "./command/RunAs";
import { CommandRegistry } from "./command/CommandRegistry";
import { ServiceRegistry } from "../services/ServicesRegistry";
import { Command } from "./command/Command";
import { CommandGroup } from "./command/CommandGroup";

type ParentCommand = Command & {
  children: CommandGroup;
  noPrefixAliases: string[];
  prefixes: string[] | string;
};

export class AliasChecker {
  private gowonService = ServiceRegistry.get(GowonService);
  private commandRegistry = CommandRegistry.getInstance();

  constructor(private aliasesString: string) {}

  async parentCommandGetChildNoPrefix(
    command: ParentCommand,
    childAlias: string,
    serverID: string
  ): Promise<Command | undefined> {
    const child = await this.commandRegistry.find(
      childAlias,
      serverID,
      command.children.commands
    );

    if (child.command && command.noPrefixAliases.includes(childAlias)) {
      return child.command;
    }

    return undefined;
  }

  parentCommandHasAlias(command: ParentCommand, alias: string): boolean {
    return typeof command.prefixes === "string"
      ? command.prefixes.toLowerCase().trim() === alias.trim().toLowerCase()
      : command.prefixes.map((p) => p.toLowerCase().trim()).includes(alias);
  }

  commandHasAlias(command: Command, alias: string): boolean {
    if (command.hasChildren) {
      return this.parentCommandHasAlias(command as ParentCommand, alias);
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
      const variations =
        v.variation instanceof Array ? v.variation : [v.variation];

      const found = !!variations.find(
        (v) => v.toLowerCase() === variation.toLowerCase()
      );

      if (found) return found;
    }

    return false;
  }

  async getRunAs(command: Command, serverID: string): Promise<RunAs> {
    const checks = this.aliasesString
      .toLowerCase()
      .replace(new RegExp(this.gowonService.regexSafePrefix(serverID), "i"), "")
      .trim()
      .split(/\s+/);

    const runAs = new RunAs();

    let parent: { command?: Command; atIndex?: number } = {};

    for (let checkIndex = 0; checkIndex < checks.length; checkIndex++) {
      const check = checks[checkIndex];

      if (command.hasChildren) {
        if (this.parentCommandHasAlias(command as ParentCommand, check)) {
          parent = {
            command,
            atIndex: checkIndex,
          };
        }

        if (
          parent.command &&
          parent.atIndex &&
          parent.atIndex + 1 === checkIndex
        ) {
          return runAs.add({
            string: checks[parent.atIndex],
            command: parent.command,
          });
        }

        let child = await command.getChild(
          checks.slice(checkIndex + 1).join(" ") || "",
          serverID
        );

        let childNoPrefix = await this.parentCommandGetChildNoPrefix(
          command as ParentCommand,
          check,
          serverID
        );

        if (childNoPrefix)
          return runAs.add({ string: check, command: childNoPrefix });

        if (
          child &&
          this.parentCommandHasAlias(command as ParentCommand, check)
        ) {
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
