import { BaseService } from "../BaseService";
import { DisabledCommand } from "../../database/entity/DisabledCommand";
import {
  CommandNotDisabledError,
  CommandAlreadyDisabledError,
  MismatchedPermissionsError,
  RecordNotFoundError,
  DuplicateRecordError,
  LogicError,
} from "../../errors";
import { Permission } from "../../database/entity/Permission";
import { Can } from "../../lib/permissions/Can";
import { QueryFailedError } from "typeorm";
import { ChannelBlacklist } from "../../database/entity/ChannelBlacklist";
import { CacheScopedKey } from "../../database/cache/ShallowCache";
import { GowonClient } from "../../lib/GowonClient";
import { Logger } from "../../lib/Logger";

export class AdminService extends BaseService {
  get can(): Can {
    return new Can(this);
  }

  constructor(private gowonClient: GowonClient, logger?: Logger) {
    super(logger);
  }

  async disableCommand(
    commandID: string,
    serverID: string,
    commandFriendlyName: string,
    dev = false
  ): Promise<DisabledCommand> {
    let disabledCommand = await DisabledCommand.findOne({
      where: { commandID, serverID },
    });

    if (disabledCommand) throw new CommandAlreadyDisabledError();

    this.log("disabling `" + commandFriendlyName + "` for server " + serverID);

    let newDisabledCommand = DisabledCommand.create({
      commandID,
      serverID,
      commandFriendlyName,
      devPermission: dev,
    });

    await newDisabledCommand.save();

    return newDisabledCommand;
  }

  async enableCommand(
    commandID: string,
    serverID: string,
    enablerID: string
  ): Promise<DisabledCommand> {
    let disabledCommand = await DisabledCommand.findOne({
      where: { commandID, serverID },
    });

    if (!disabledCommand) throw new CommandNotDisabledError();

    if (
      disabledCommand.devPermission &&
      !this.gowonClient.isDeveloper(enablerID)
    ) {
      throw new LogicError(
        "You need to be a developer to reenable this command!"
      );
    }

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

  async listDisabled(serverID: string): Promise<DisabledCommand[]> {
    return await DisabledCommand.find({ serverID });
  }

  private async setPermissions(
    entityID: string,
    serverID: string,
    commandID: string,
    isBlacklist: boolean,
    isRoleBased: boolean,
    commandFriendlyName: string
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
      this.log(
        `Creating new permission for entity ${entityID} and command ${commandID} in ${serverID}`
      );

      newPermissions = Permission.create({
        entityID,
        serverID,
        commandID,
        isBlacklist,
        isRoleBased,
        commandFriendlyName,
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
    isRoleBased: boolean,
    commandFriendlyName: string
  ): Promise<Permission> {
    return await this.setPermissions(
      entityID,
      serverID,
      commandID,
      true,
      isRoleBased,
      commandFriendlyName
    );
  }

  async whitelist(
    entityID: string,
    serverID: string,
    commandID: string,
    isRoleBased: boolean,
    commandFriendlyName: string
  ): Promise<Permission> {
    return await this.setPermissions(
      entityID,
      serverID,
      commandID,
      false,
      isRoleBased,
      commandFriendlyName
    );
  }

  async whiteOrBlacklist(
    entityID: string,
    serverID: string,
    commandID: string,
    isRoleBased: boolean,
    isBlacklist: boolean,
    commandFriendlyName: string
  ): Promise<Permission> {
    return await this.setPermissions(
      entityID,
      serverID,
      commandID,
      isBlacklist,
      isRoleBased,
      commandFriendlyName
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

    this.log(
      `Removing permission for entity ${entityID} and command ${commandID} in ${serverID}`
    );

    await permission.remove();

    return permission;
  }

  async listPermissions(serverID: string): Promise<Permission[]> {
    this.log(`Listing permissions in ${serverID}`);
    return await Permission.find({ where: { serverID } });
  }

  async listPermissionsForCommand(
    serverID: string,
    commandID: string
  ): Promise<Permission[]> {
    this.log(`Listing permissions in ${serverID} for command ${commandID}`);
    return await Permission.find({ where: { serverID, commandID } });
  }

  async listPermissionsForEntity(
    serverID: string,
    entityID: string
  ): Promise<Permission[]> {
    this.log(`Listing permissions in ${serverID} for entity ${entityID}`);
    return await Permission.find({ where: { serverID, entityID } });
  }

  async blacklistCommandFromChannel(
    serverID: string,
    commandID: string,
    channelID: string
  ): Promise<ChannelBlacklist> {
    this.log(
      `blacklisting ${commandID} in #${channelID} in the server ${serverID}`
    );
    let existingChannelBlacklist = await ChannelBlacklist.findOne({
      serverID,
      commandID,
      channelID,
    });

    if (existingChannelBlacklist)
      throw new DuplicateRecordError("channel blacklist");

    let channelBlacklist = ChannelBlacklist.create({
      serverID,
      commandID,
      channelID,
    });

    await channelBlacklist.save();

    let channelBlacklists = [
      ...(await this.gowonService.getChannelBlacklists(serverID)),
      channelBlacklist,
    ];

    await this.gowonService.shallowCache.remember(
      CacheScopedKey.ChannelBlacklists,
      channelBlacklists,
      serverID
    );

    return channelBlacklist;
  }

  async unblacklistCommandFromChannel(
    serverID: string,
    commandID: string,
    channelID: string
  ): Promise<ChannelBlacklist> {
    let channelBlacklist = await ChannelBlacklist.findOne({
      serverID,
      commandID,
      channelID,
    });

    if (!channelBlacklist) throw new RecordNotFoundError("channel blacklist");

    let channelBlacklists = (
      await this.gowonService.getChannelBlacklists(serverID)
    ).filter((cr) => cr.id !== channelBlacklist!.id);

    await channelBlacklist.remove();

    this.gowonService.shallowCache.remember(
      CacheScopedKey.ChannelBlacklists,
      channelBlacklists,
      serverID
    );

    return channelBlacklist;
  }
}
