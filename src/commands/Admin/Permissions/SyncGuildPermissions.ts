import { PermissionsChildCommand } from "./PermissionsChildCommand";

export class SyncGuildPermissions extends PermissionsChildCommand {
  idSeed = "kep1er huening bahiyyih";

  description = "Syncs your server roles with Gowon's slash commands";
  usage = "";

  slashCommand = true;
  adminCommand = true;

  async run() {
    await this.permissionsService.syncGuildPermissions(this.ctx);

    const embed = this.authorEmbed()
      .setHeader("Sync guild permissions")
      .setDescription("Successfully guild synced permissions!");

    await this.send(embed);
  }
}
