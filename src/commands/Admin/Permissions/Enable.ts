import { Message } from "discord.js";
import { CommandManager } from "../../../lib/command/CommandManager";
import { PermissionsChildCommand } from "../Permissions/PermissionsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";

export class Enable extends PermissionsChildCommand {
  description = "Re-enable a command globally";
  usage = "command"

  commandManager = new CommandManager();

  arguments: Arguments = {
    inputs: this.arguments.inputs,
  };

  shouldBeIndexed = false

  async run(message: Message) {
    let disabledCommand = await this.adminService.enableCommand(
      this.command.id,
      message.guild?.id!
    );

    await message.channel.send(
      `Successfully re-enabled ${this.commandManager
        .findByID(disabledCommand.commandID)
        ?.name.code()}`
    );
  }
}
