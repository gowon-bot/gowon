import { DiscordRoleArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordRoleArgument";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { InfoEmbed } from "../../../lib/ui/embeds/InfoEmbed";
import { SuccessEmbed } from "../../../lib/ui/embeds/SuccessEmbed";

import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { PermissionsChildCommand } from "./PermissionsChildCommand";

const args = {
  adminRole: new DiscordRoleArgument({
    description: "The role to make the admin role",
  }),
};

export class SetAdminRole extends PermissionsChildCommand<typeof args> {
  idSeed = "dreamnote lara";

  description =
    "Any user with this role will be treated like an administrator when running Gowon commands";
  extraDescription =
    ".\nNote that any user with the discord 'Administrator' permission automatically has access to all admin commands";

  aliases = ["adminrole"];

  usage = "command";
  shouldBeIndexed = false;

  slashCommand = true;
  slashCommandName = "adminrole";

  arguments = args;

  settingsService = ServiceRegistry.get(SettingsService);

  private readonly adminRoleHelp =
    "Any user with the admin role can use Gowon's admin-only commands";

  async run() {
    if (this.parsedArguments.adminRole) {
      const adminRole = this.parsedArguments.adminRole;

      this.settingsService.set(
        this.ctx,
        "adminRole",
        { guildID: this.requiredGuild.id },
        adminRole.id
      );

      const embed = new SuccessEmbed()
        .setDescription(
          `Successfully set <@&${adminRole.id}> as the administrator role!`
        )
        .setFooter(this.adminRoleHelp);

      await this.reply(embed);
    } else {
      const adminRole = this.settingsService.get("adminRole", {
        guildID: this.requiredGuild.id,
      });

      const embed = new InfoEmbed()
        .setDescription(
          adminRole
            ? `The current admin role is: <@&${adminRole}>`
            : `There is no admin role yet, you can set one by running: \n\n\`${this.prefix}perms setadminrole @role\`\nor\n\`${this.prefix}perms setadminrole <role id>\``
        )
        .setFooter(this.adminRoleHelp);

      await this.reply(embed);
    }
  }
}
