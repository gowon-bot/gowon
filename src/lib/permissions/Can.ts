import { AdminService } from "../../services/dbservices/AdminService";
import { GuildMember, Message } from "discord.js";
import { Permission } from "../../database/entity/Permission";
import { Command } from "../command/Command";
import { ChildCommand } from "../command/ParentCommand";
import { In } from "typeorm";
import { GowonClient } from "../GowonClient";
import { checkRollout } from "../../helpers/permissions";
import { CommandRegistry } from "../command/CommandRegistry";
import { BaseService, BaseServiceContext } from "../../services/BaseService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { GowonService } from "../../services/GowonService";
import { asyncMap } from "../../helpers";

export enum CheckFailReason {
  disabled = "disabled",
  forbidden = "forbidden",
  blacklistedFromChannel = "blacklisted from channel",
}

export interface CanCheck {
  passed: boolean;
  reason?: CheckFailReason;
}

type CanContext = BaseServiceContext & {
  adminService: AdminService;
  client: GowonClient;
};

type MutableContext = {
  cachedPermissons?: {
    [commandID: string]: Permission[];
  };
};

export class Can extends BaseService<CanContext, MutableContext> {
  private commandRegistry = CommandRegistry.getInstance();

  private get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  private getCachedPermissions(ctx: CanContext & MutableContext) {
    if (!ctx.cachedPermissons) ctx.cachedPermissons = {};

    return ctx.cachedPermissons;
  }

  private async getParentIDs(
    ctx: CanContext,
    child: ChildCommand
  ): Promise<string[]> {
    const runAs = await this.commandRegistry.find(
      child.parentName,
      this.guild(ctx).id
    );

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
    ctx: CanContext,
    commandID: string
  ): Promise<boolean> {
    const serverID = this.guild(ctx).id;
    const channelID = ctx.command.message.channel.id;

    let channelBlacklists = await this.gowonService.getChannelBlacklists(
      serverID
    );

    return !channelBlacklists.find(
      (cb) => cb.commandID === commandID && cb.channelID === channelID
    );
  }

  async run(
    ctx: CanContext,
    command: Command,
    { useChannel }: { useChannel?: boolean } = { useChannel: false }
  ): Promise<CanCheck> {
    const client = ctx.client;
    const message = ctx.command.message as Message;

    if (client.isDeveloper(message.author.id)) return { passed: true };

    if (command.devCommand) {
      return { passed: false, reason: CheckFailReason.forbidden };
    }

    if (!this.checkRollout(ctx, command)) {
      return { passed: false, reason: CheckFailReason.disabled };
    }

    const isAdmin = message.member?.permissions?.has("ADMINISTRATOR");

    if (useChannel && !(await this.canRunInChannel(ctx, command.id))) {
      return { passed: false, reason: CheckFailReason.blacklistedFromChannel };
    }

    let permissions: Permission[];

    permissions =
      this.getCachedPermissions(ctx)[command.id] ||
      (await Permission.find({
        where: {
          serverID: message.guild?.id,
          commandID:
            command instanceof ChildCommand
              ? In([command.id, ...(await this.getParentIDs(ctx, command))])
              : command.id,
        },
      }));

    if (!this.getCachedPermissions(ctx)[command.id]) {
      this.getCachedPermissions(ctx)[command.id] = permissions;
    }

    const disabled = (
      await asyncMap(
        command instanceof ChildCommand
          ? [command.id, ...(await this.getParentIDs(ctx, command))]
          : [command.id],
        (id) => ctx.adminService.isCommandDisabled(ctx, id)
      )
    ).reduce((acc, c) => {
      if (acc) return true;
      if (c.isDisabled && c.dev) return true;
      if (c.isDisabled && !isAdmin) return true;

      return false;
    }, false);

    const hasPermission = this.userHasPermissions(message.member!, permissions);

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

  async viewList(ctx: CanContext, commands: Command[]): Promise<Command[]> {
    const message = ctx.command.message;

    const allPermissions = await Permission.find({
      where: { serverID: message.guild?.id! },
    });

    allPermissions.forEach((c) => {
      if (!this.getCachedPermissions(ctx)[c.id])
        this.getCachedPermissions(ctx)[c.id] = [];

      this.getCachedPermissions(ctx)[c.id].push(c);
    });

    const passed = [] as Command[];

    for (const command of commands) {
      const check = await this.run(ctx, command);

      if (check.passed) passed.push(command);
    }

    return passed;
  }

  private checkRollout(ctx: CanContext, command: Command) {
    return checkRollout(command.rollout, ctx.command.message);
  }
}
