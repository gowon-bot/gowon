import { Guild, GuildMember } from "discord.js";
import gql from "graphql-tag";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { GowonContext } from "../../lib/context/Context";
import { Logger } from "../../lib/Logger";
import { BaseService } from "../BaseService";
import { AdminService } from "../dbservices/AdminService";
import { MirrorballService } from "../mirrorball/MirrorballService";
import { ServiceRegistry } from "../ServicesRegistry";

export class GuildEventService extends BaseService {
  get adminService() {
    return ServiceRegistry.get(AdminService);
  }
  get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
  }
  commandRegistry = CommandRegistry.getInstance();

  async init() {
    await this.commandRegistry.init();
  }

  public async handleNewGuild(ctx: GowonContext, guild: Guild) {
    Logger.log("GuildEventService", `setting up Gowon for ${guild.name}`);

    ctx.dangerousSetCommand({ message: { guild } });

    await this.registerUsers(ctx, guild);
  }

  public async handleGuildLeave(ctx: GowonContext, guild: Guild) {
    Logger.log("GuildEventService", `tearing down Gowon for ${guild.name}`);

    ctx.dangerousSetCommand({ message: { guild } });
  }

  public async handleNewUser(ctx: GowonContext, guildMember: GuildMember) {
    Logger.log("GuildEventService", "Handling new user");

    try {
      await this.mirrorballService.quietAddUserToGuild(
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
      await this.mirrorballService.quietRemoveUserFromGuild(
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
