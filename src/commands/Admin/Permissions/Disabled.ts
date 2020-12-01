import { Message } from "discord.js";
import { PermissionsChildCommand } from "../Permissions/PermissionsChildCommand";

export class Disabled extends PermissionsChildCommand {
  description = "List all disabled commands";
  usage = "";
  aliases = ["listdisabled", "disabledcommands"];

  async prerun() {}

  async run(message: Message) {
    let disabledCommands = await this.adminService.listDisabled(
      message.guild?.id!
    );

    let embed = this.newEmbed()
      .setTitle(`Disabled commands in ${message.guild?.name}`)
      .setDescription(
        disabledCommands.length
          ? disabledCommands
              .map((dc) => dc.commandFriendlyName.code())
              .join(", ")
          : "This server does not have any disabled commands!"
      );

    await this.send(embed);
  }
}
