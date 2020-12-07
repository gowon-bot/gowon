import { AdminService } from "../../services/dbservices/AdminService";
import { GuildMember, Message } from "discord.js";
import { Permission } from "../../database/entity/Permission";
import { Command } from "../command/Command";
import { ChildCommand } from "../command/ParentCommand";
import { CommandManager } from "../command/CommandManager";
import { In } from "typeorm";
import { GowonService } from "../../services/GowonService";
import { GowonClient } from "../GowonClient";

export enum CheckFailReason {
  disabled = "disabled",
  forbidden = "forbidden",
  blacklistedFromChannel = "blacklisted from channel",
}

export interface CanCheck {
  passed: boolean;
  reason?: CheckFailReason;
}

export class Can {
  commandManager = new CommandManager();
  private gowonService = GowonService.getInstance();

  cachedPermissons: {
    [commandID: string]: Permission[];
  } = {};

  constructor(private adminService: AdminService) {}

  private async getParentIDs(
    child: ChildCommand,
    serverID: string
  ): Promise<string[]> {
    if (!this.commandManager.isInitialized) await this.commandManager.init();

    let runAs = await this.commandManager.find(child.parentName, serverID);

    return runAs.runAs.toCommandArray().map((c) => c.id);
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

  private async canRunInChannel(
    serverID: string,
    commandID: string,
    channelID: string
  ): Promise<boolean> {
    let channelBlacklists = await this.gowonService.getChannelBlacklists(
      serverID
    );

    return !channelBlacklists.find(
      (cb) => cb.commandID === commandID && cb.channelID === channelID
    );
  }

  async run(
    command: Command,
    message: Message,
    client: GowonClient,
    { useChannel }: { useChannel?: boolean } = { useChannel: false }
  ): Promise<CanCheck> {
    if (client.isDeveloper(message.author.id)) return { passed: true };

    if (command.devCommand)
      return { passed: false, reason: CheckFailReason.forbidden };

    if (message.member?.hasPermission("ADMINISTRATOR")) return { passed: true };

    if (
      useChannel &&
      !(await this.canRunInChannel(
        message.guild!.id,
        command.id,
        message.channel.id
      ))
    )
      return { passed: false, reason: CheckFailReason.blacklistedFromChannel };

    let permissions: Permission[];

    permissions =
      this.cachedPermissons[command.id] ||
      (await Permission.find({
        where: {
          serverID: message.guild?.id,
          commandID:
            command instanceof ChildCommand
              ? In([
                  command.id,
                  ...(await this.getParentIDs(command, message.guild!.id)),
                ])
              : command.id,
        },
      }));

    if (!this.cachedPermissons[command.id])
      this.cachedPermissons[command.id] = permissions;

    let disabledCheck = (
      await Promise.all(
        (command instanceof ChildCommand
          ? [
              command.id,
              ...(await this.getParentIDs(command, message.guild!.id)),
            ]
          : [command.id]
        ).map((id) => {
          return this.adminService.isCommandDisabled(id, message.guild?.id!);
        })
      )
    ).reduce((acc, c) => {
      if (!acc) acc = c;
      return acc;
    }, false);

    let disabled = disabledCheck;

    let hasPermission = this.userHasPermissions(message.member!, permissions);

    return {
      passed: !disabled && hasPermission,
      reason:
        !disabled && hasPermission
          ? undefined
          : !disabled
          ? CheckFailReason.forbidden
          : CheckFailReason.disabled,
    };
  }

  async viewList(
    commands: Command[],
    message: Message,
    guild: GowonClient
  ): Promise<Command[]> {
    let allPermissions = await Permission.find({
      where: { serverID: message.guild?.id! },
    });

    allPermissions.forEach((c) => {
      if (!this.cachedPermissons[c.id]) this.cachedPermissons[c.id] = [];

      this.cachedPermissons[c.id].push(c);
    });

    let passed = [] as Command[];

    for (let command of commands) {
      let check = await this.run(command, message, guild);

      if (check.passed) passed.push(command);
    }

    return passed;
  }
}
