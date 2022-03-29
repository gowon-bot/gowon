import { ApplicationCommand, Guild, GuildResolvable } from "discord.js";
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
          return await this.unregisterUserPermission(
            ctx,
            applicationCommand,
            permission
          );
      }
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
      (c) => c.name === (command.slashCommandName || command.name)
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
      (c) => c.name === (command.slashCommandName || command.name)
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
      guild: guildID,
      permissions: [
        {
          id: userID,
          type: "USER",
          permission: false,
        },
      ],
    });
  }

  private async unregisterBotPermission() {
    throw "owned";
  }

  private async unregisterUserPermission(
    ctx: GowonContext,
    applicationCommand: ApplicationCommand<{ guild: GuildResolvable }>,
    permission: Permission
  ) {
    await applicationCommand.permissions.remove({
      guild: ctx.requiredGuild,
      users: [permission.entityID!],
    });
  }
}
