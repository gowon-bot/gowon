import { AdminService } from "../../services/dbservices/AdminService";
import { GuildMember } from "discord.js";
import { Permission } from "../../database/entity/Permission";
import { Command } from "../command/Command";
import { ChildCommand } from "../command/ParentCommand";
import { In } from "typeorm";
import { checkRollout } from "../../helpers/permissions";
import { CommandRegistry } from "../command/CommandRegistry";
import { BaseService } from "../../services/BaseService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { GowonService } from "../../services/GowonService";
import { asyncMap } from "../../helpers";
import { SettingsService } from "../settings/SettingsService";
import { GowonContext } from "../context/Context";

export enum CheckFailReason {
  disabled = "disabled",
  forbidden = "forbidden",
  blacklistedFromChannel = "blacklisted from channel",
}

export interface CanCheck {
  passed: boolean;
  reason?: CheckFailReason;
}

type CanContext = GowonContext<{
  constants: {
    adminService: AdminService;
  };
  mutable?: {
    cachedPermissons?: {
      [commandID: string]: Permission[];
    };
    adminRole?: string;
  };
}>;

export class Can extends BaseService<CanContext> {
  private commandRegistry = CommandRegistry.getInstance();

  private get gowonService() {
    return ServiceRegistry.get(GowonService);
  }

  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }

  private getCachedPermissions(ctx: CanContext) {
    if (!ctx.mutable.cachedPermissons) ctx.mutable.cachedPermissons = {};

    return ctx.mutable.cachedPermissons;
  }

  private getAdminRole(ctx: CanContext): string | undefined {
    if (!this.ctx.hasOwnProperty("adminRole"))
      ctx.mutable.adminRole = this.settingsService.get("adminRole", {
        guildID: ctx.guild.id,
      });

    return ctx.mutable.adminRole;
  }

  private async getParentIDs(
    ctx: CanContext,
    child: ChildCommand
  ): Promise<string[]> {
    const runAs = await this.commandRegistry.find(
      child.parentName,
      ctx.guild.id
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
    const serverID = ctx.guild.id;
    const channelID = ctx.payload.channel.id;

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

    if (client.isDeveloper(ctx.author.id)) return { passed: true };

    if (command.devCommand) {
      return { passed: false, reason: CheckFailReason.forbidden };
    }

    if (!this.checkRollout(ctx, command)) {
      return { passed: false, reason: CheckFailReason.disabled };
    }

    const isAdmin = this.isAdmin(ctx);

    if (command.adminCommand) {
      return isAdmin
        ? { passed: true }
        : { passed: false, reason: CheckFailReason.forbidden };
    }

    if (useChannel && !(await this.canRunInChannel(ctx, command.id))) {
      return { passed: false, reason: CheckFailReason.blacklistedFromChannel };
    }

    let permissions: Permission[];

    permissions =
      this.getCachedPermissions(ctx)[command.id] ||
      (await Permission.find({
        where: {
          serverID: ctx.guild?.id,
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
        (id) => ctx.constants.adminService.isCommandDisabled(ctx, id)
      )
    ).reduce((acc, c) => {
      if (acc) return true;
      if (c.isDisabled && c.dev) return true;
      if (c.isDisabled && !isAdmin) return true;

      return false;
    }, false);

    const hasPermission = this.userHasPermissions(
      ctx.payload.member!,
      permissions
    );

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
    const message = ctx.payload;

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
    return checkRollout(command.rollout, ctx.payload);
  }

  private isAdmin(ctx: CanContext): boolean {
    const adminRole = this.getAdminRole(ctx);

    return (
      ctx.authorMember?.permissions?.has("ADMINISTRATOR") ||
      (adminRole && ctx.authorMember?.roles.cache.has(adminRole)) ||
      false
    );
  }
}
