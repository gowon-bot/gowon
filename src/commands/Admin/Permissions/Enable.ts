import { Message } from "discord.js";
import { PermissionsChildCommand } from "../Permissions/PermissionsChildCommand";

export class Enable extends PermissionsChildCommand {
  idSeed = "loona heejin";

  description = "Re-enable a command";
  usage = "command";
  shouldBeIndexed = false;

  async run(message: Message) {
    let disabledCommand = await this.adminService.enableCommand(
      this.command.id,
      message.guild?.id!,
      this.author.id
    );

    await this.send(
      `Successfully re-enabled ${this.commandRegistry
        .findByID(disabledCommand.commandID, { includeSecret: true })
        ?.name.code()}`
    );
  }
}
