import { PermissionsChildCommand } from "./PermissionsChildCommand";

export class Help extends PermissionsChildCommand {
  idSeed = "loona hyunjin";

  description = "Shows help about permissions";
  usage = "";

  slashCommand = true;

  async run() {
    const prefix = this.prefix;

    await this.send(
      this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions help"))
        .addField(
          "Disabling commands",
          `You can disable a command by running \`${prefix}disable <commandName>\`.\
          This will disable for all non-admin users. To enable it again, run \`${prefix}enable <commandName>\`.`
        )
        .addField(
          "Disabling commands for users/roles",
          `You can also set permissions on commands for certain users and roles. Run \`${prefix}userdisable <commandName> @user/role\` to ban a user/role from running a a command. Use \`${prefix}userenable\` to re-enable it.`
        )
        .addField(
          "Disabling commands in channels",
          `You can restrict users from running commands in certain channels. Run \`${prefix}channeldisable <commandName> #channel\` to ban a command from being run in a channel. Use \`${prefix}channelenable\` to re-enable it.`
        )
        .addField(
          "Admin priveleges",
          `All users with \`ADMINISTRATOR\` priveliges in Discord automatically bypass any permissions checks. This means that if you want to only allow administrators to run a command, you can use the disable command. With \`${prefix}setadminrole\`, you can set a role to behave as if users with that role was an administrator.`
        )
    );
  }
}
