import { Message } from "discord.js";
import { QueryFailedError } from "typeorm";
import { Permission, PermissionType } from "../../database/entity/Permission";
import {
  PermissionAlreadyExistsError,
  PermissionDoesNotExistError,
} from "../../errors/permissions";
import { asyncMap } from "../../helpers";
import { BaseService } from "../../services/BaseService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { Command } from "../command/Command";
import { CommandRegistry } from "../command/CommandRegistry";
import { GowonContext } from "../context/Context";
import { SettingsService } from "../settings/SettingsService";
import {
  PermissionQuery,
  PermissionsCacheContext,
  PermissionsCacheService,
} from "./PermissionsCacheService";
import { PermissionsRegister } from "./PermissionsRegister";

export type FailReason = "developer" | "admin";
export interface CanCheck {
  allowed: boolean;
  permission?: Permission | FailReason;
}

export class PermissionsService extends BaseService {
  private get permissionsCacheService() {
    return ServiceRegistry.get(PermissionsCacheService);
  }

  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }

  private permissionsRegister = new PermissionsRegister();
  private commandRegistry = CommandRegistry.getInstance();

  async createPermission(
    ctx: GowonContext,
    command: Command,
    permission: Permission
  ) {
    try {
      await permission.save();
    } catch (e) {
      if (
        e instanceof QueryFailedError &&
        e.message.includes("duplicate key value violates unique constraint")
      ) {
        throw new PermissionAlreadyExistsError(permission);
      } else throw e;
    }

    await this.permissionsRegister.register(ctx, command, permission);
    await this.permissionsCacheService.savePermissionToRedis(ctx, permission);
  }

  async destroyPermission(
    ctx: GowonContext,
    command: Command,
    permission: Permission
  ) {
    const dbPermission = await Permission.findOne(permission);

    if (!dbPermission) {
      throw new PermissionDoesNotExistError(permission);
    }

    await dbPermission.remove();

    await this.permissionsRegister.unregister(ctx, command, permission);
    await this.permissionsCacheService.deletePermissionFromRedis(
      ctx,
      permission
    );
  }

  async listPermissions(ctx: GowonContext, queries: PermissionQuery[]) {
    this.log(ctx, `Fetching permissions from ${queries.length} queries`);

    const permissions = await Permission.getFromQueries(queries);

    return permissions;
  }

  // Can
  async canRunInContext(
    ctx: PermissionsCacheContext,
    command: Command
  ): Promise<CanCheck> {
    await this.permissionsCacheService.cachePermissionsInContext(
      ctx,
      this.permissionsCacheService.getAllPermissionQueries(ctx, command)
    );

    return await this.canRunCommand(ctx, command);
  }

  async canListInContext(
    ctx: PermissionsCacheContext,
    commands: Command[],
    permissionQueries?: PermissionQuery[]
  ): Promise<(CanCheck & { command: Command })[]> {
    await this.permissionsCacheService.cachePermissionsInContext(
      ctx,
      permissionQueries ||
        this.permissionsCacheService.getAllPermissionQueries(ctx)
    );

    return asyncMap(commands, async (command) => ({
      ...(await this.canRunCommand(ctx, command)),
      command,
    }));
  }

  private async canRunCommand(
    ctx: PermissionsCacheContext,
    command: Command
  ): Promise<CanCheck> {
    // This order is important:
    // developers can run any command (even bot-wide disabled ones), admins cannot
    return (
      (await this.checkParentCommand(ctx, command.parentID)) ||
      this.checkDeveloper(ctx, command) ||
      this.canRunBotWide(ctx, command) ||
      this.checkAdmin(ctx, command) ||
      this.userCanRun(ctx, command) ||
      this.canRunInGuild(ctx, command) ||
      this.rolesCanRun(ctx, command) ||
      this.guildMemberCanRun(ctx, command) ||
      this.canRunInChannel(ctx, command) || { allowed: true }
    );
  }

  private userCanRun(
    ctx: PermissionsCacheContext,
    command: Command
  ): CanCheck | undefined {
    const permission = this.permissionsCacheService.get(ctx, {
      type: PermissionType.user,
      commandID: command.id,
      entityID: ctx.author.id,
    });

    if (permission) {
      return { allowed: false, permission };
    }

    return undefined;
  }

  private canRunBotWide(
    ctx: GowonContext,
    command: Command
  ): CanCheck | undefined {
    const permission = this.permissionsCacheService.get(ctx, {
      type: PermissionType.bot,
      commandID: command.id,
      entityID: "",
    });

    if (permission) {
      return { allowed: false, permission };
    }

    return undefined;
  }

  private canRunInChannel(
    ctx: PermissionsCacheContext,
    command: Command
  ): CanCheck | undefined {
    const permission = this.permissionsCacheService.get(ctx, {
      type: PermissionType.channel,
      commandID: command.id,
      entityID: (ctx.payload.source as Message).channelId,
    });

    if (permission) {
      return { allowed: false, permission };
    }

    return undefined;
  }

  private canRunInGuild(
    ctx: PermissionsCacheContext,
    command: Command
  ): CanCheck | undefined {
    if (ctx.payload.guild) {
      const permission = this.permissionsCacheService.get(ctx, {
        type: PermissionType.guild,
        commandID: command.id,
        entityID: ctx.payload.guild.id,
      });

      if (permission) {
        return { allowed: false, permission };
      }
    }

    return undefined;
  }

  private guildMemberCanRun(
    ctx: GowonContext,
    command: Command
  ): CanCheck | undefined {
    if (ctx.payload.guild) {
      const permission = this.permissionsCacheService.get(ctx, {
        type: PermissionType.guildMember,
        commandID: command.id,
        entityID: `${ctx.payload.guild.id}:${ctx.author.id}`,
      });

      if (permission) {
        return { allowed: false, permission };
      }
    }

    return undefined;
  }

  private rolesCanRun(
    ctx: GowonContext,
    command: Command
  ): CanCheck | undefined {
    if (ctx.payload.guild && ctx.authorMember) {
      for (const role of ctx.authorMember.roles.cache.values()) {
        const permission = this.permissionsCacheService.get(ctx, {
          type: PermissionType.role,
          commandID: command.id,
          entityID: role.id,
        });

        if (permission) {
          return { allowed: false, permission };
        }
      }
    }

    return undefined;
  }

  private checkDeveloper(
    ctx: GowonContext,
    command: Command
  ): CanCheck | undefined {
    if (ctx.client.isDeveloper(ctx.author.id)) return { allowed: true };

    if (command.devCommand) {
      return { allowed: false, permission: "developer" };
    }

    return undefined;
  }

  private checkAdmin(
    ctx: PermissionsCacheContext,
    command: Command
  ): CanCheck | undefined {
    const adminRole =
      ctx.constants.isAdmin === undefined
        ? this.settingsService.get("adminRole", {
            guildID: ctx.guild?.id,
          })
        : undefined;

    const isAdmin =
      ctx.constants.isAdmin !== undefined
        ? ctx.constants.isAdmin
        : (adminRole && ctx.authorMember.roles.cache.has(adminRole)) ||
          ctx.authorMember.permissions.has("ADMINISTRATOR");

    console.log("isAdmin", isAdmin);

    if (isAdmin) return { allowed: true };

    if (command.adminCommand) {
      return { allowed: false, permission: "admin" };
    }

    return undefined;
  }

  private async checkParentCommand(
    ctx: GowonContext,
    parentID: string | undefined
  ): Promise<CanCheck | undefined> {
    if (!parentID) return undefined;

    const parentCommand = this.commandRegistry.findByID(parentID);

    if (!parentCommand) return undefined;

    return await this.canRunInContext(ctx, parentCommand);
  }
}
