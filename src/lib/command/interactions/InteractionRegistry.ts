import { Command } from "../Command";
import { CommandRegistry } from "../CommandRegistry";
import { RunAs } from "../RunAs";
import { InteractionRegister } from "./InteractionRegister";

export class InteractionRegistry {
  register = new InteractionRegister();

  constructor(private commandRegistry: CommandRegistry) {}

  async init() {
    this.register.init();
    this.register.register(this.getCommands());
  }

  find(options: Partial<{ byName: string; withSubcommand: string }>): {
    command?: Command;
    runAs?: RunAs;
  } {
    if (options.byName) {
      const command = this.getCommands().find(
        (c) =>
          c.slashCommandName === options.byName ||
          c.name === options.byName ||
          c.friendlyName === options.byName ||
          this.matchesVariations(c, options.byName!)
      );

      const runAs = new RunAs();

      if (command) runAs.add({ command: command, string: options.byName });

      if (options.withSubcommand && command) {
        if (command.hasChildren) {
          const subcommand = command.children?.commands?.find(
            (c) =>
              c.slashCommandName === options.withSubcommand ||
              c.name === options.withSubcommand ||
              c.friendlyName === options.withSubcommand ||
              this.matchesVariations(c, options.withSubcommand!)
          );

          if (subcommand) {
            runAs.add({ string: options.withSubcommand, command: subcommand });
          }

          return { command: subcommand, runAs };
        }
      } else return { command, runAs };
    }

    return {};
  }

  private getCommands(): Command[] {
    return this.commandRegistry
      .list(true)
      .filter((c) => !!c.slashCommand) as Command[];
  }

  private matchesVariations(command: Command, name: string): boolean {
    for (let v of command.variations) {
      const variations =
        v.variation instanceof Array ? v.variation : [v.variation];

      const found = !!variations.find(
        (v) => v.toLowerCase() === name.toLowerCase()
      );

      if (found) return found;
    }

    return false;
  }
}
