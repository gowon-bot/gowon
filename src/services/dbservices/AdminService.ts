import { BaseService } from "../BaseService";
import { DisabledCommand } from "../../database/entity/DisabledCommand";
import {
  CommandNotDisabledError,
  CommandAlreadyDisabledError,
  MismatchedPermissionsError,
} from "../../errors";
import { Message, GuildMember } from "discord.js";
import { Permission } from "../../database/entity/Permission";

export enum CheckFailReason {
  disabled = "disabled",
  forbidden = "forbidden",
}

export interface CanCheck {
  passed: boolean;
  reason?: CheckFailReason;
}

class Can {
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
      ? user.user.id === permission.id.toString()
      : user.user.id !== permission.id.toString();
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

export class AdminService extends BaseService {
  get can(): Can {
    return new Can(this);
  }

  async disableCommand(
    commandName: string,
    serverID: string
  ): Promise<DisabledCommand> {
    let disabledCommand = await DisabledCommand.findOne({
      where: { commandName, serverID },
    });

    if (disabledCommand) throw new CommandAlreadyDisabledError();

    this.log("disabling " + commandName + " for server " + serverID);

    let newDisabledCommand = DisabledCommand.create({ commandName, serverID });

    await newDisabledCommand.save();

    return newDisabledCommand;
  }

  async enableCommand(
    commandName: string,
    serverID: string
  ): Promise<DisabledCommand> {
    let disabledCommand = await DisabledCommand.findOne({
      where: { commandName, serverID },
    });

    if (!disabledCommand) throw new CommandNotDisabledError();

    this.log("enabling " + commandName + " for server " + serverID);

    await disabledCommand.remove();

    return disabledCommand;
  }

  async isCommandDisabled(
    commandName: string,
    serverID: string
  ): Promise<boolean> {
    this.log("checking if " + commandName + " is disabled in " + serverID);

    let dc = await DisabledCommand.findOne({
      where: { serverID, commandName },
    });

    return !!dc;
  }

  private async setPermissions(
    entityID: string,
    serverID: string,
    commandName: string,
    isBlacklist: boolean,
    isRoleBased: boolean
  ): Promise<Permission> {
    let permissions = await Permission.find({
      where: { serverID, entityID, commandName },
    });

    let permissionsMismatched =
      isBlacklist !==
      (permissions[0] ? permissions[0].isBlacklist : isBlacklist);

    if (permissionsMismatched)
      throw new MismatchedPermissionsError(permissions[0].isBlacklist);

    let newPermissions = Permission.create({
      entityID,
      serverID,
      commandName,
      isBlacklist,
      isRoleBased,
    });

    await newPermissions.save();

    return newPermissions;
  }

  async blacklist(
    entityID: string,
    serverID: string,
    commandName: string,
    isRoleBased: boolean
  ): Promise<Permission> {
    return await this.setPermissions(
      entityID,
      serverID,
      commandName,
      true,
      isRoleBased
    );
  }

  async whitelist(
    entityID: string,
    serverID: string,
    commandName: string,
    isRoleBased: boolean
  ): Promise<Permission> {
    return await this.setPermissions(
      entityID,
      serverID,
      commandName,
      false,
      isRoleBased
    );
  }
}
