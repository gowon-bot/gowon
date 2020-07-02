import { BaseService } from "../BaseService";
import { DisabledCommand } from "../../database/entity/DisabledCommand";
import {
  CommandNotDisabledError,
  CommandAlreadyDisabledError,
  MismatchedPermissionsError,
  RecordNotFoundError,
} from "../../errors";
import { Permission } from "../../database/entity/Permission";
import { Can } from "../../lib/permissions/Can";

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

  async delist(
    entityID: string,
    serverID: string,
    commandName: string
  ): Promise<Permission> {
    let permission = await Permission.findOne({
      where: { entityID, serverID, commandName },
    });

    if (!permission) throw new RecordNotFoundError("permission");

    await permission.remove();

    return permission;
  }
}
