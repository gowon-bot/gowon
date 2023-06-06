import { Guild, GuildMember, Role } from "discord.js";
import { Logger } from "../../lib/Logger";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { GowonContext } from "../../lib/context/Context";
import { PermissionsService } from "../../lib/permissions/PermissionsService";
import { MockMessage } from "../../mocks/discord";
import { BaseService } from "../BaseService";
import { ServiceRegistry } from "../ServicesRegistry";
import { LilacGuildsService } from "../lilac/LilacGuildsService";

export class GuildEventService extends BaseService {
  get lilacGuildsService() {
    return ServiceRegistry.get(LilacGuildsService);
  }
  get permissionsService() {
    return ServiceRegistry.get(PermissionsService);
  }

  commandRegistry = CommandRegistry.getInstance();

  public async handleNewGuild(ctx: GowonContext, guild: Guild): Promise<void> {
    Logger.log("GuildEventService", `setting up Gowon for ${guild.name}`);

    ctx.payload.source = new MockMessage("", { guild });

    await Promise.all([
      this.registerUsers(ctx, guild),
      this.permissionsService.syncGuildPermissions(ctx),
      this.lilacGuildsService.create(guild.id),
    ]);
  }

  public async handleGuildLeave(
    ctx: GowonContext,
    guild: Guild
  ): Promise<void> {
    Logger.log("GuildEventService", `tearing down Gowon for ${guild.name}`);

    this.lilacGuildsService.clear(ctx, guild.id);
  }

  public async handleNewUser(
    ctx: GowonContext,
    guildMember: GuildMember
  ): Promise<void> {
    Logger.log("GuildEventService", "Handling new user");

    await this.lilacGuildsService.addUser(
      ctx,
      guildMember.user.id,
      guildMember.guild.id
    );

    this.lilacGuildsService.syncIfRequired(ctx, guildMember.guild);
  }

  public async handleUserLeave(
    ctx: GowonContext,
    guildMember: GuildMember
  ): Promise<void> {
    Logger.log("GuildEventService", "Handling user leave");

    await this.lilacGuildsService.removeUser(
      ctx,
      guildMember.user.id,
      guildMember.guild.id
    );
  }

  public async handleRoleUpdate(
    ctx: GowonContext,
    oldRole: Role,
    newRole: Role
  ): Promise<void> {
    if (
      oldRole.permissions.has("ADMINISTRATOR") !==
      newRole.permissions.has("ADMINISTRATOR")
    ) {
      ctx.payload.source = new MockMessage("", { guild: newRole.guild });

      this.permissionsService.syncGuildPermissions(ctx, [newRole]);
    }
  }

  public async handleRoleCreate(ctx: GowonContext, role: Role): Promise<void> {
    if (role.permissions.has("ADMINISTRATOR")) {
      ctx.payload.source = new MockMessage("", { guild: role.guild });

      this.permissionsService.syncGuildPermissions(ctx, [role]);
    }
  }

  private async registerUsers(ctx: GowonContext, guild: Guild): Promise<void> {
    const members = await guild.members.fetch();

    const discordIDs = members.map((m) => m.id);
    const guildID = guild.id;

    await this.lilacGuildsService.sync(ctx, guildID, discordIDs);
  }
}
