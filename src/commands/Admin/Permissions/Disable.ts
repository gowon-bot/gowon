import { CommandNotFoundError, LogicError } from "../../../errors";
import { PermissionsChildCommand } from "./PermissionsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";

export class Disable extends PermissionsChildCommand {
  idSeed = "red velvet yeri";

  description = "Disable a command";

  usage = "command";

  arguments: Arguments = {
    inputs: this.arguments.inputs,
  };

  async run() {
    if (!this.command) throw new CommandNotFoundError();
    if (["enable", "disable"].includes(this.command.name))
      throw new LogicError(
        `You can't disable the ${this.command.name.code()} command!`
      );

    let disabledCommand = await this.adminService.disableCommand(
      this.ctx,
      this.command.id,
      this.commandRunAs.toCommandFriendlyName()
    );

    await this.send(
      `Successfully disabled ${this.commandRegistry
        .findByID(disabledCommand.commandID, { includeSecret: true })
        ?.name?.code()}`
    );
  }
}
