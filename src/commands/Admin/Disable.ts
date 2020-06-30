import { Message } from "discord.js";
import { NoCommand } from "../../lib/command/BaseCommand";
import { CommandNotFoundError, LogicError } from "../../errors";
import { PermissionsChildCommand } from "./Permissions/PermissionsChildCommand";

export default class Disable extends PermissionsChildCommand {
  description = "Disable a command globally";

  async run(message: Message) {
    if (this.command instanceof NoCommand) throw new CommandNotFoundError();
    if (["enable", "disable"].includes(this.command.name))
      throw new LogicError(
        `You can't disable the \`${this.command.name}\` command!`
      );

    let disabledCommand = await this.adminService.disableCommand(
      this.command.name,
      message.guild?.id!
    );

    await message.channel.send(
      `Successfully disabled \`${disabledCommand.commandName}\``
    );
  }
}
