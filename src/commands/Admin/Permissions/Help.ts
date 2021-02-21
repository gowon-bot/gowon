import { Message } from "discord.js";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

export class Help extends PermissionsChildCommand {
  idSeed = "loona hyunjin";

  description = "Shows help about permissions";
  usage = "";

  arguments = {};
  async prerun() {}

  async run(message: Message) {
    let prefix = this.prefix;

    await this.send(
      this.newEmbed()
        .setTitle(`Permissions help for ${message.author.username}`)
        .addField(
          "Disabling commands",
          `You can disable a command by running \`${prefix}disable <commandName>\`.\
          This will disable for all users. To enable it again, run \`${prefix}enable <commandName>\``
        )
        .addField(
          "White- and blacklisting",
          `You can also set permissions on commands for certain users and roles. If you use blacklist for a command, only users who are not in the blacklist can run it. If you whitelist for a command, only users who are in the whitelist can use it.
          _Note that you can't mix white- and blacklisting_`
        )
        .addField(
          "Channel restrictions",
          `You can restrict users from running certain commands in certain channels by running channel blacklist. Eg. \`${prefix}perms channelblacklist <commandName> #channel1 #channel2\``
        )
        .addField(
          "Admin priveleges",
          "All users with `ADMINISTRATOR` priveliges in Discord automatically bypass any permissions checks. This means that if you want to only allow administrators to run a command, you can use the disable command.\n\n" +
            "By default, the `permissions` and `crowns kill` commands are disabled (essentially restricting them to admins)"
        )
    );
  }
}
