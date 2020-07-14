import { Message } from "discord.js";
import { NoCommand } from "../../lib/command/BaseCommand";
import { CommandNotFoundError, LogicError } from "../../errors";
import { PermissionsChildCommand } from "./Permissions/PermissionsChildCommand";
import { Arguments } from "../../lib/arguments/arguments";

export default class Disable extends PermissionsChildCommand {
  description = "Disable a command globally";

  arguments: Arguments = {
    ...this.arguments.inputs,
  };

  async run(message: Message) {
    if (this.command instanceof NoCommand) throw new CommandNotFoundError();
    if (["enable", "disable"].includes(this.command.name))
      throw new LogicError(
        `You can't disable the ${this.command.name.code()} command!`
      );

    let disabledCommand = await this.adminService.disableCommand(
      this.command.id,
      message.guild?.id!,
      this.runAs.toCommandFriendlyName()
    );

    await message.channel.send(
      `Successfully disabled ${this.commandManager
        .findByID(disabledCommand.commandID)
        ?.name.code()}`
    );
  }
}
