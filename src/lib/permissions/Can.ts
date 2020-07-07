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
    return permission.isRoleBased
      ? permission.isBlacklist
        ? !user.roles.cache.has(permission.entityID)
        : user.roles.cache.has(permission.entityID)
      : permission.isBlacklist
      ? user.user.id !== permission.entityID
      : user.user.id === permission.entityID;
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

  async run(commandID: string, message: Message): Promise<CanCheck> {
    if (message.member?.hasPermission("ADMINISTRATOR")) return { passed: true };

    let permissions = await Permission.find({
      where: { serverID: message.guild?.id, commandID },
    });

    let notDisabled = !(await this.adminService.isCommandDisabled(
      commandID,
      message.guild?.id!
    ));

    let hasPermission = this.userHasPermissions(message.member!, permissions);

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
