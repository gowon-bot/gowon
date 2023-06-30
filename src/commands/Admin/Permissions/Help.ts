import { PermissionsChildCommand } from "./PermissionsChildCommand";

export class Help extends PermissionsChildCommand {
  idSeed = "loona hyunjin";

  description = "Shows help about permissions";
  usage = "";

  slashCommand = true;
  guildRequired = false;

  async run() {
    const prefix = this.prefix;

    await this.send(
      this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Permissions help"))
        .addFields([
          {
            name: "Disabling commands",
            value: `You can disable a command by running \`${prefix}disable <commandName>\`.\
          This will disable for all non-admin users. To enable it again, run \`${prefix}enable <commandName>\`.`,
          },
          {
            name: "Disabling commands for users",
            value: `You can also set permissions on commands for certain users. Run \`${prefix}userdisable <commandName> @user\` to ban a user from running a command. Use \`${prefix}userenable\` to re-enable it.`,
          },
          {
            name: "Disabling commands for roles",
            value: `It also works for roles. Run \`${prefix}roledisable <commandName> @role\` to ban a role from running a command. Use \`${prefix}roleenable\` to re-enable it.`,
          },
          {
            name: "Disabling commands in channels",
            value: `You can restrict users from running commands in certain channels. Run \`${prefix}channeldisable <commandName> #channel\` to ban a command from being run in a channel. Use \`${prefix}channelenable\` to re-enable it.`,
          },

          {
            name: "Admin priveleges",
            value: `All users with \`ADMINISTRATOR\` priveliges in Discord automatically bypass any permissions checks. This means that if you want to only allow administrators to run a command, you can use the disable command. With \`${prefix}setadminrole\`, you can set a role to behave as if users with that role was an administrator.`,
          },
        ])
    );
  }
}
