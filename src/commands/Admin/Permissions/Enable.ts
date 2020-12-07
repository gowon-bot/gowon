import { Message } from "discord.js";
import { CommandManager } from "../../../lib/command/CommandManager";
import { PermissionsChildCommand } from "../Permissions/PermissionsChildCommand";

export class Enable extends PermissionsChildCommand {
  idSeed = "loona heejin";

  description = "Re-enable a command";
  usage = "command";
  shouldBeIndexed = false;

  commandManager = new CommandManager();

  async run(message: Message) {
    let disabledCommand = await this.adminService.enableCommand(
      this.command.id,
      message.guild?.id!,
      this.author.id
    );

    await this.send(
      `Successfully re-enabled ${this.commandManager
        .findByID(disabledCommand.commandID)
        ?.name.code()}`
    );
  }
}
