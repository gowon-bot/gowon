import { AdminBaseChildCommand } from "../AdminBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { CommandManager } from "../../../lib/command/CommandManager";
import { NoCommand, Command } from "../../../lib/command/BaseCommand";
import { CommandNotFoundError } from "../../../errors";

export abstract class PermissionsChildCommand extends AdminBaseChildCommand {
  parentName = "permissions";

  commandManager = new CommandManager();
  command!: Command;
  aliases!: string[];

  throwOnNoCommand = true;

  arguments: Arguments = {
    inputs: {
      command: { index: { start: 0 } },
    },
  };

  async prerun() {
    await this.commandManager.init();

    this.aliases = (this.parsedArguments.command as string).split(/\s*\//);

    this.command = this.commandManager.find(this.aliases.join(" ")).command;

    if (this.command instanceof NoCommand && this.throwOnNoCommand)
      throw new CommandNotFoundError();
  }
}
