import { Message } from "discord.js";
import { CommandManager } from "../../../lib/command/CommandManager";
import { PermissionsChildCommand } from "../Permissions/PermissionsChildCommand";

export class Enable extends PermissionsChildCommand {
  description = "Re-enable a command globally";
  usage = "command";
  shouldBeIndexed = false;

  commandManager = new CommandManager();


  async run(message: Message) {
    let disabledCommand = await this.adminService.enableCommand(
      this.command.id,
      message.guild?.id!
    );

    await this.send(
      `Successfully re-enabled ${this.commandManager
        .findByID(disabledCommand.commandID)
        ?.name.code()}`
    );
  }
}
