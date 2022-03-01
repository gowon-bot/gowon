import { BaseCommand } from "../BaseCommand";
import { CommandRegistry } from "../CommandRegistry";
import { InteractionRegister } from "./InteractionRegister";

export class InteractionRegistry {
  register = new InteractionRegister();

  constructor(private commandRegistry: CommandRegistry) {}

  async init() {
    this.register.init();
    this.register.register(this.getCommands());
  }

  find(
    options: Partial<{ byName: string; withSubcommand: string }>
  ): BaseCommand | undefined {
    if (options.byName) {
      const command = this.getCommands().find(
        (c) =>
          c.slashCommandName === options.byName ||
          c.name === options.byName ||
          c.friendlyName === options.byName
      );

      if (options.withSubcommand && command) {
        if (command.hasChildren) {
          return command.children?.commands?.find(
            (c) =>
              c.slashCommandName === options.withSubcommand ||
              c.name === options.withSubcommand
          ) as BaseCommand;
        }
      } else return command;
    }

    return undefined;
  }

  private getCommands(): BaseCommand[] {
    return this.commandRegistry
      .list(true)
      .filter((c) => !!c.slashCommand) as BaseCommand[];
  }
}
