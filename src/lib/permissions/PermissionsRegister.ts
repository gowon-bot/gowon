import {
  ApplicationCommand,
  ApplicationCommandPermissionType,
  Guild,
  GuildResolvable,
} from "discord.js";
import { discordToken } from "../../../config.json";
import { Permission, PermissionType } from "../../database/entity/Permission";
import { Command } from "../command/Command";
import { GowonContext } from "../context/Context";

export class PermissionsRegister {
  async register(
    ctx: GowonContext,
    command: Command,
    permission: Permission
  ): Promise<void> {
    const applicationCommand =
      (await this.getApplicationCommand(ctx, command)) ||
      (await this.getGuildApplicationCommand(ctx, command));

    if (applicationCommand) {
      switch (permission.type) {
        case PermissionType.bot:
          return await this.registerBotPermission();

        case PermissionType.guildMember:
          return await this.registerGuildMemberPermission(
            applicationCommand,
            permission
          );

        case PermissionType.role:
          return await this.registerRolePermission(
            ctx,
            applicationCommand,
            permission
          );
      }
    }
  }

  async unregister(
    ctx: GowonContext,
    command: Command,
    permission: Permission
  ): Promise<void> {
    const applicationCommand =
      (await this.getApplicationCommand(ctx, command)) ||
      (await this.getGuildApplicationCommand(ctx, command));

    if (applicationCommand) {
      switch (permission.type) {
        case PermissionType.bot:
          return await this.unregisterBotPermission();

        case PermissionType.user:
          return await this.unregisterGuildMemberPermission(
            ctx,
            applicationCommand,
            permission
          );
        case PermissionType.role:
          return await this.unregisterRolePermission(
            ctx,
            applicationCommand,
            permission
          );
      }
    }
  }

  async registerMany(
    ctx: GowonContext,
    command: Command,
    permissions: Permission[]
  ) {
    const filteredPermissions = permissions.filter((p) =>
      [PermissionType.role, PermissionType.user].includes(p.type)
    );

    if (!filteredPermissions.length) return;

    const applicationCommand =
      (await this.getApplicationCommand(ctx, command)) ||
      (await this.getGuildApplicationCommand(ctx, command));

    if (applicationCommand) {
      // Typescript seems to a bit flaky with this function call,
      // complaining that "guild" shouldn't be there
      await applicationCommand.permissions.set({
        token: discordToken,
        guild: ctx.requiredGuild,
        permissions: filteredPermissions.map((permission) => ({
          id: permission.entityID!,
          type:
            permission.type === PermissionType.role
              ? ApplicationCommandPermissionType.Role
              : ApplicationCommandPermissionType.User,
          permission: permission.allow || false,
        })),
      } as any);
    }
  }

  private async getApplicationCommand(
    ctx: GowonContext,
    command: Command
  ): Promise<ApplicationCommand<{ guild: Guild }> | undefined> {
    if (!ctx.client.client.application?.owner) {
      await ctx.client.client.application?.fetch();
    }

    const commands = await ctx.client.client.application!.commands.fetch();

    const applicationCommand = commands.find(
      (c) => c.name === (command.slashCommandName || command.friendlyName)
    );

    return applicationCommand;
  }

  private async getGuildApplicationCommand(
    ctx: GowonContext,
    command: Command
  ): Promise<ApplicationCommand | undefined> {
    if (!ctx.client.client.application?.owner) {
      await ctx.client.client.application?.fetch();
    }

    const commands = await ctx.requiredGuild.commands.fetch();

    const applicationCommand = commands.find(
      (c) => c.name === (command.slashCommandName || command.friendlyName)
    );

    return applicationCommand;
  }

  private async registerBotPermission() {
    throw "Ah! So sorry";
  }

  private async registerGuildMemberPermission(
    applicationCommand: ApplicationCommand<{ guild: GuildResolvable }>,
    permission: Permission
  ) {
    const [guildID, userID] = permission.entityID!.split(":");

    await applicationCommand.permissions.add({
      token: discordToken,
      guild: guildID,
      permissions: [
        {
          id: userID,
          type: ApplicationCommandPermissionType.User,
          permission: permission.allow || false,
        },
      ],
    });
  }

  private async registerRolePermission(
    ctx: GowonContext,
    applicationCommand: ApplicationCommand<{ guild: GuildResolvable }>,
    permission: Permission
  ) {
    await applicationCommand.permissions.add({
      token: discordToken,
      guild: ctx.requiredGuild.id,
      permissions: [
        {
          id: permission.entityID!,
          type: ApplicationCommandPermissionType.Role,
          permission: permission.allow || false,
        },
      ],
    });
  }

  private async unregisterBotPermission() {
    throw "owned";
  }

  private async unregisterGuildMemberPermission(
    ctx: GowonContext,
    applicationCommand: ApplicationCommand<{ guild: GuildResolvable }>,
    permission: Permission
  ) {
    await applicationCommand.permissions.remove({
      token: discordToken,
      guild: ctx.requiredGuild,
      users: [permission.entityID!],
    });
  }

  private async unregisterRolePermission(
    ctx: GowonContext,
    applicationCommand: ApplicationCommand<{ guild: GuildResolvable }>,
    permission: Permission
  ) {
    await applicationCommand.permissions.remove({
      token: discordToken,
      guild: ctx.requiredGuild,
      roles: [permission.entityID!],
    });
  }
}
