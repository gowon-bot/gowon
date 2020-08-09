import { Message, MessageEmbed } from "discord.js";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

export class Help extends PermissionsChildCommand {
  description = "Shows help about permissions";
  usage = ""

  arguments = {};
  async prerun() {}

  async run(message: Message) {
    await message.channel.send(
      new MessageEmbed()
        .setTitle(`Permissions help for ${message.author.username}`)
        .addField(
          "Disabling commands",
          `You can disable a command by running \`${this.botMomentService.prefix}disable <commandName>\`.\
          This will disable for all users. To enable it again, run \`${this.botMomentService.prefix}enable <commandName>\``
        )
        .addField(
          "White- and blacklisting",
          `You can also set permissions on commands for certain users and roles. If you use blacklist for a command, only users who are not in the blacklist can run it. If you whitelist for a command, only users who are in the whitelist can use it.
          _Note that you can't mix white- and blacklisting_`
        )
        .setFooter(
          "All users with `ADMINISTRATOR` priveliges in Discord automatically bypass any permissions checks"
        )
    );
  }
}
