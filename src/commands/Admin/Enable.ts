import { Message } from "discord.js";
import { CommandManager } from "../../lib/command/CommandManager";
import { PermissionsChildCommand } from "./Permissions/PermissionsChildCommand";

export default class Enable extends PermissionsChildCommand {
  description = "Re-enable a command globally";

  commandManager = new CommandManager();

  async run(message: Message) {
    let disabledCommand = await this.adminService.enableCommand(
      this.command.id,
      message.guild?.id!
    );

    await message.channel.send(
      `Successfully re-enabled \`${
        this.commandManager.findByID(disabledCommand.commandID)?.name
      }\``
    );
  }
}
