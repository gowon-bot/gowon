import { Message, MessageEmbed } from "discord.js";
import { PermissionsChildCommand } from "./Permissions/PermissionsChildCommand";

export default class Disabled extends PermissionsChildCommand {
  description = "List all disabled commands";
  aliases = ["listdisabled", "disabledcommands"];

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

    await message.channel.send(embed);
  }
}
