import { __DeprecatedChannelBlacklist } from "../database/entity/ChannelBlacklist";
import { __DeprecatedDisabledCommand } from "../database/entity/DisabledCommand";
import { __DeprecatedPermission } from "../database/entity/OldPermission";
import { Permission, PermissionType } from "../database/entity/Permission";
import { CommandRegistry } from "../lib/command/CommandRegistry";
import { GowonContext } from "../lib/context/Context";
import { PermissionsService } from "../lib/permissions/PermissionsService";
import { ServiceRegistry } from "../services/ServicesRegistry";

export default async function convertOldPermissions(ctx: GowonContext) {
  const commandRegistry = CommandRegistry.getInstance();
  const permissionsService = ServiceRegistry.get(PermissionsService);

  // User and role permissions
  const permissions = await __DeprecatedPermission.find();
  for (const permission of permissions) {
    // We don't care about dev permissions
    if (permission.devPermission) continue;

    const command = commandRegistry.findByID(permission.commandID);
    if (!command) continue;

    const newPermission = Permission.create({
      commandID: permission.commandID,
      entityID: permission.entityID,
      allow: !permission.isBlacklist,
    });

    if (permission.isRoleBased) {
      newPermission.type = PermissionType.role;
      await permissionsService.createPermission(ctx, command, newPermission);
    } else {
      newPermission.type = PermissionType.guildMember;
      newPermission.entityID = `${permission.serverID}:${permission.entityID}`;
      await permissionsService.createPermission(ctx, command, newPermission);
    }
  }

  // Channel permissions
  const channelBlacklists = await __DeprecatedChannelBlacklist.find();
  for (const channelBlacklist of channelBlacklists) {
    const command = commandRegistry.findByID(channelBlacklist.commandID);
    if (!command) continue;

    const permission = Permission.create({
      entityID: channelBlacklist.channelID,
      commandID: channelBlacklist.commandID,
      type: PermissionType.channel,
    });

    await permissionsService.createPermission(ctx, command, permission);
  }

  // Guild permissions
  const disabledCommands = await __DeprecatedDisabledCommand.find();
  for (const disabledCommand of disabledCommands) {
    const command = commandRegistry.findByID(disabledCommand.commandID);
    if (!command || command.adminCommand) continue;

    const permission = Permission.create({
      entityID: disabledCommand.serverID,
      commandID: disabledCommand.commandID,
      type: PermissionType.guild,
    });

    await permissionsService.createPermission(ctx, command, permission);
  }
}
