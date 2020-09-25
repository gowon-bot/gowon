import { Message, MessageEmbed } from "discord.js";
import { PermissionsChildCommand } from "../Permissions/PermissionsChildCommand";

export class RestrictToChannel extends PermissionsChildCommand {
  description = "Restrict a command to a channel";
  usage = "command #channel";
  aliases = ["restrict"];

  async prerun() {}

  async run(message: Message) {
    let disabledCommands = await this.adminService.listDisabled(
      message.guild?.id!
    );

    let embed = new MessageEmbed()
      .setTitle(`Disabled commands in ${message.guild?.name}`)
      .setDescription(
        disabledCommands.length
          ? disabledCommands
              .map((dc) => dc.commandFriendlyName.code())
              .join(", ")
          : `This server does not have any disabled commands!`
      );

    await this.send(embed);
  }
}
