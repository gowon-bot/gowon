import { Message } from "discord.js";
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

  async run(message: Message) {
    if (!this.command) throw new CommandNotFoundError();
    if (["enable", "disable"].includes(this.command.name))
      throw new LogicError(
        `You can't disable the ${this.command.name.code()} command!`
      );

    let disabledCommand = await this.adminService.disableCommand(
      this.command.id,
      message.guild?.id!,
      this.runAs.toCommandFriendlyName()
    );

    await this.send(
      `Successfully disabled ${this.commandManager
        .findByID(disabledCommand.commandID, { includeSecret: true })
        ?.name?.code()}`
    );
  }
}
