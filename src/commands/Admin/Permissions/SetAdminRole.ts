import { SettingsService } from "../../../lib/settings/SettingsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { PermissionsChildCommand } from "../Permissions/PermissionsChildCommand";

export class SetAdminRole extends PermissionsChildCommand {
  idSeed = "dreamnote lara";

  description =
    "Sets the administrator role, any user with this role will be treated like an administrator when running Gowon commands\nNote that any user with the discord 'Administrator' permission automatically has access to all admin commands ";
  usage = "command";
  shouldBeIndexed = false;

  settingsService = ServiceRegistry.get(SettingsService);

  throwOnNoCommand = false;

  private readonly adminRoleHelp =
    "Any user with the admin role can use Gowon's admin-only commands";

  async run() {
    if (this.roles.length) {
      const adminRole = this.roles[0];

      this.settingsService.set(
        this.ctx,
        "adminRole",
        { guildID: this.guild.id },
        adminRole.id
      );

      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Administrator role"))
        .setDescription(
          `Successfully set <@&${adminRole.id}> as the administrator role!`
        )
        .setFooter({ text: this.adminRoleHelp });

      await this.send(embed);
    } else {
      const adminRole = this.settingsService.get("adminRole", {
        guildID: this.guild.id,
      });

      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Administrator role"))
        .setDescription(
          adminRole
            ? `The current admin role is: <@&${adminRole}>`
            : `There is no admin role yet, you can set one by running: \n\n\`${this.prefix}perms setadminrole @role\`\nor\n\`${this.prefix}perms setadminrole <role id>\``
        )
        .setFooter({ text: this.adminRoleHelp });

      await this.send(embed);
    }
  }
}
