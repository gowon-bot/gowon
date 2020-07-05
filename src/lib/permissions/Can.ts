import { AdminService } from "../../services/dbservices/AdminService";
import { GuildMember, Message } from "discord.js";
import { Permission } from "../../database/entity/Permission";
import { Logger } from "../Logger";

export enum CheckFailReason {
  disabled = "disabled",
  forbidden = "forbidden",
}

export interface CanCheck {
  passed: boolean;
  reason?: CheckFailReason;
}

export class Can {
  adminService: AdminService;

  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  private hasPermission(user: GuildMember, permission: Permission): boolean {
    Logger.log("User", user)
    Logger.log("Permission", Logger.formatObject(permission))

    return permission.isRoleBased
      ? permission.isBlacklist
        ? !user.roles.cache.has(permission.entityID)
        : user.roles.cache.has(permission.entityID)
      : permission.isBlacklist
      ? user.user.id !== permission.id.toString()
      : user.user.id === permission.id.toString();
  }

  private userHasPermissions(
    user: GuildMember,
    permissions: Permission[]
  ): boolean {
    if (!permissions.length) return true;

    if (permissions[0].isBlacklist) {
      for (let permission of permissions)
        if (!this.hasPermission(user, permission)) return false;

      return true;
    } else {
      for (let permission of permissions)
        if (this.hasPermission(user, permission)) return true;

      return false;
    }
  }

  async run(commandName: string, message: Message): Promise<CanCheck> {
    if (message.member?.hasPermission("ADMINISTRATOR")) return { passed: true };

    let permissions = await Permission.find({
      where: { serverID: message.guild?.id, commandName },
    });

    let notDisabled = !(await this.adminService.isCommandDisabled(
      commandName,
      message.guild?.id!
    ));

    let hasPermission = this.userHasPermissions(message.member!, permissions);

    Logger.log("Permissions", Logger.formatObject(permissions));

    return {
      passed: notDisabled && hasPermission,
      reason:
        notDisabled && hasPermission
          ? undefined
          : notDisabled
          ? CheckFailReason.forbidden
          : CheckFailReason.disabled,
    };
  }
}
