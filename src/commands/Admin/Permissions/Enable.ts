import { code } from "../../../helpers/discord";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { PermissionsChildCommand } from "../Permissions/PermissionsChildCommand";

const args = {
  command: new StringArgument({ index: { start: 0 } }),
} as const;

export class Enable extends PermissionsChildCommand {
  idSeed = "loona heejin";

  description = "Re-enable a command";
  usage = "command";

  // Remove mentions inherited from child command
  arguments = args as any;

  async run() {
    let disabledCommand = await this.adminService.enableCommand(
      this.ctx,
      this.command.id
    );

    await this.send(
      `Successfully re-enabled ${code(
        this.commandRegistry.findByID(disabledCommand.commandID, {
          includeSecret: true,
        })?.name!
      )}`
    );
  }
}
