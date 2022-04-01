import { Guild, GuildMember } from "discord.js";
import gql from "graphql-tag";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { GowonContext } from "../../lib/context/Context";
import { Logger } from "../../lib/Logger";
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
  commandRegistry = CommandRegistry.getInstance();

  public async handleNewGuild(ctx: GowonContext, guild: Guild) {
    Logger.log("GuildEventService", `setting up Gowon for ${guild.name}`);

    ctx.dangerousSetCommand({ message: { guild } });

    await this.registerUsers(ctx, guild);
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
