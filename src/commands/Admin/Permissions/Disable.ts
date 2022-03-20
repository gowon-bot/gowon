import { CommandNotFoundError, LogicError } from "../../../errors/errors";
import { code } from "../../../helpers/discord";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

const args = {
  command: new StringArgument({ index: { start: 0 } }),
} as const;

export class Disable extends PermissionsChildCommand {
  idSeed = "red velvet yeri";

  description = "Disable a command";

  usage = "command";

  // Remove mentions inherited from child command
  arguments = args as any;

  async run() {
    if (!this.command) throw new CommandNotFoundError();
    if (["enable", "disable"].includes(this.command.name))
      throw new LogicError(
        `You can't disable the ${code(this.command.name)} command!`
      );

    let disabledCommand = await this.adminService.disableCommand(
      this.ctx,
      this.command.id,
      this.commandRunAs.toCommandFriendlyName()
    );

    await this.send(
      `Successfully disabled ${code(
        this.commandRegistry.findByID(disabledCommand.commandID, {
          includeSecret: true,
        })?.name!
      )}`
    );
  }
}
