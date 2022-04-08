import { Guild, GuildMember, Role } from "discord.js";
import gql from "graphql-tag";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { GowonContext } from "../../lib/context/Context";
import { Logger } from "../../lib/Logger";
import { PermissionsService } from "../../lib/permissions/PermissionsService";
import { MockMessage } from "../../mocks/discord";
import { BaseService } from "../BaseService";
import { MirrorballService } from "../mirrorball/MirrorballService";
import { MirrorballUsersService } from "../mirrorball/services/MirrorballUsersService";
import { ServiceRegistry } from "../ServicesRegistry";

export class GuildEventService extends BaseService {
  get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
  }

  get mirrorballUsersService() {
    return ServiceRegistry.get(MirrorballUsersService);
  }

  get permissionsService() {
    return ServiceRegistry.get(PermissionsService);
  }

  commandRegistry = CommandRegistry.getInstance();

  public async handleNewGuild(ctx: GowonContext, guild: Guild) {
    Logger.log("GuildEventService", `setting up Gowon for ${guild.name}`);

    ctx.payload.source = new MockMessage("", { guild });

    await Promise.all([
      this.registerUsers(ctx, guild),
      this.permissionsService.syncGuildPermissions(ctx),
    ]);
  }

  public async handleGuildLeave(ctx: GowonContext, guild: Guild) {
    Logger.log("GuildEventService", `tearing down Gowon for ${guild.name}`);

    ctx.dangerousSetCommand({ message: { guild } });

    const mutation = gql`
      mutation guildLeave($guildID: String!) {
        deleteGuild(guildID: $guildID)
      }
    `;

    this.mirrorballService.mutate(ctx, mutation, { guildID: guild.id });
  }

  public async handleNewUser(ctx: GowonContext, guildMember: GuildMember) {
    Logger.log("GuildEventService", "Handling new user");

    try {
      await this.mirrorballUsersService.quietAddUserToGuild(
        ctx,
        guildMember.user.id,
        guildMember.guild.id
      );
    } catch (e) {
      Logger.log(
        "GuildEventService",
        `Failed to log in guildMember ${guildMember.user.id} in ${guildMember.guild.id} (${e})`
      );
    }
  }

  public async handleUserLeave(ctx: GowonContext, guildMember: GuildMember) {
    Logger.log("GuildEventService", "Handling user leave");

    try {
      await this.mirrorballUsersService.quietRemoveUserFromGuild(
        ctx,
        guildMember.user.id,
        guildMember.guild.id
      );
    } catch (e) {
      Logger.log(
        "GuildEventService",
        `Failed to log out guildMember ${guildMember.user.id} in ${guildMember.guild.id} (${e})`
      );
    }
  }

  public async handleRoleUpdate(
    ctx: GowonContext,
    oldRole: Role,
    newRole: Role
  ) {
    if (
      oldRole.permissions.has("ADMINISTRATOR") !==
      newRole.permissions.has("ADMINISTRATOR")
    ) {
      ctx.payload.source = new MockMessage("", { guild: newRole.guild });

      this.permissionsService.syncGuildPermissions(ctx, [newRole]);
    }
  }

  public async handleRoleCreate(ctx: GowonContext, role: Role) {
    if (role.permissions.has("ADMINISTRATOR")) {
      ctx.payload.source = new MockMessage("", { guild: role.guild });

      this.permissionsService.syncGuildPermissions(ctx, [role]);
    }
  }

  private async registerUsers(ctx: GowonContext, guild: Guild) {
    const members = await guild.members.fetch();

    const mutation = gql`
      mutation syncGuild($guildID: String!, $discordIDs: [String!]!) {
        syncGuild(guildID: $guildID, discordIDs: $discordIDs)
      }
    `;

    const discordIDs = members.map((m) => m.id);
    const guildID = guild.id;

    await this.mirrorballService.mutate(ctx, mutation, { discordIDs, guildID });
  }
}
