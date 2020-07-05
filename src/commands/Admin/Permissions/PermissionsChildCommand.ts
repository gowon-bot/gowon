import { AdminBaseChildCommand } from "../AdminBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { CommandManager } from "../../../lib/command/CommandManager";
import { NoCommand, Command } from "../../../lib/command/BaseCommand";
import { CommandNotFoundError } from "../../../errors";

export abstract class PermissionsChildCommand extends AdminBaseChildCommand {
  parentName = "permissions";

  commandManager = new CommandManager();
  command!: Command;
  alias!: string;

  throwOnNoCommand = true

  arguments: Arguments = {
    inputs: {
      command: { index: 0 },
    },
  };

  async prerun() {
    await this.commandManager.init();

    this.alias = this.parsedArguments.command as string;

    this.command = this.commandManager.find(this.alias).command;

    if (this.command instanceof NoCommand && this.throwOnNoCommand) throw new CommandNotFoundError();
  }
}
