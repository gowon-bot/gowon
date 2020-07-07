import { BaseService } from "../BaseService";
import { DisabledCommand } from "../../database/entity/DisabledCommand";
import {
  CommandNotDisabledError,
  CommandAlreadyDisabledError,
  MismatchedPermissionsError,
  RecordNotFoundError,
  DuplicateRecordError,
} from "../../errors";
import { Permission } from "../../database/entity/Permission";
import { Can } from "../../lib/permissions/Can";
import { QueryFailedError } from "typeorm";

export class AdminService extends BaseService {
  get can(): Can {
    return new Can(this);
  }

  async disableCommand(
    commandID: string,
    serverID: string
  ): Promise<DisabledCommand> {
    let disabledCommand = await DisabledCommand.findOne({
      where: { commandID, serverID },
    });

    if (disabledCommand) throw new CommandAlreadyDisabledError();

    this.log("disabling " + commandID + " for server " + serverID);

    let newDisabledCommand = DisabledCommand.create({ commandID, serverID });

    await newDisabledCommand.save();

    return newDisabledCommand;
  }

  async enableCommand(
    commandID: string,
    serverID: string
  ): Promise<DisabledCommand> {
    let disabledCommand = await DisabledCommand.findOne({
      where: { commandID, serverID },
    });

    if (!disabledCommand) throw new CommandNotDisabledError();

    this.log("enabling " + commandID + " for server " + serverID);

    await disabledCommand.remove();

    return disabledCommand;
  }

  async isCommandDisabled(
    commandID: string,
    serverID: string
  ): Promise<boolean> {
    this.log("checking if " + commandID + " is disabled in " + serverID);

    let dc = await DisabledCommand.findOne({
      where: { serverID, commandID },
    });

    return !!dc;
  }

  private async setPermissions(
    entityID: string,
    serverID: string,
    commandID: string,
    isBlacklist: boolean,
    isRoleBased: boolean
  ): Promise<Permission> {
    let permissions = await Permission.find({
      where: { serverID, commandID },
      take: 1,
    });

    let permissionsMismatched =
      isBlacklist !== (permissions[0]?.isBlacklist ?? isBlacklist);

    if (permissionsMismatched)
      throw new MismatchedPermissionsError(permissions[0].isBlacklist);

    let newPermissions: Permission;

    try {
      newPermissions = Permission.create({
        entityID,
        serverID,
        commandID,
        isBlacklist,
        isRoleBased,
      });
      await newPermissions.save();
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        e.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new DuplicateRecordError("permission");
      } else throw e;
    }

    return newPermissions;
  }

  async blacklist(
    entityID: string,
    serverID: string,
    commandID: string,
    isRoleBased: boolean
  ): Promise<Permission> {
    return await this.setPermissions(
      entityID,
      serverID,
      commandID,
      true,
      isRoleBased
    );
  }

  async whitelist(
    entityID: string,
    serverID: string,
    commandID: string,
    isRoleBased: boolean
  ): Promise<Permission> {
    return await this.setPermissions(
      entityID,
      serverID,
      commandID,
      false,
      isRoleBased
    );
  }

  async whiteOrBlacklist(
    entityID: string,
    serverID: string,
    commandID: string,
    isRoleBased: boolean,
    isBlacklist: boolean
  ): Promise<Permission> {
    return await this.setPermissions(
      entityID,
      serverID,
      commandID,
      isBlacklist,
      isRoleBased
    );
  }

  async delist(
    entityID: string,
    serverID: string,
    commandID: string
  ): Promise<Permission> {
    let permission = await Permission.findOne({
      where: { entityID, serverID, commandID },
    });

    if (!permission) throw new RecordNotFoundError("permission");

    await permission.remove();

    return permission;
  }

  async listPermissions(serverID: string): Promise<Permission[]> {
    return await Permission.find({ where: { serverID } });
  }

  async listPermissionsForCommand(
    serverID: string,
    commandID: string
  ): Promise<Permission[]> {
    return await Permission.find({ where: { serverID, commandID } });
  }

  async listPermissionsForEntity(
    serverID: string,
    entityID: string
  ): Promise<Permission[]> {
    return await Permission.find({ where: { serverID, entityID } });
  }
}
