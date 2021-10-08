import { Guild, GuildMember } from "discord.js";
import gql from "graphql-tag";
import { CommandRegistry } from "../../lib/command/CommandRegistry";
import { GowonClient } from "../../lib/GowonClient";
import { displayNumber } from "../../lib/views/displays";
import { BaseService, BaseServiceContext } from "../BaseService";
import { AdminService } from "../dbservices/AdminService";
import { MirrorballService } from "../mirrorball/MirrorballService";
import { ServiceRegistry } from "../ServicesRegistry";

type GuildEventServiceContext = BaseServiceContext & {
  client: GowonClient;
};

export class GuildEventService extends BaseService<GuildEventServiceContext> {
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

  public async handleNewGuild(ctx: GuildEventServiceContext, guild: Guild) {
    this.log(ctx, `setting up Gowon for ${guild.name}`);

    ctx.command = { message: { guild } } as any;

    await this.setupPermissions(ctx, guild);
    await this.pingDeveloper(ctx, guild);
    await this.registerUsers(ctx, guild);
  }

  public async handleGuildLeave(ctx: GuildEventServiceContext, guild: Guild) {
    this.log(ctx, `tearing down Gowon for ${guild.name}`);

    ctx.command = { message: { guild } } as any;

    await this.pingDeveloper(ctx, guild, true);
  }

  public async handleNewUser(
    ctx: GuildEventServiceContext,
    guildMember: GuildMember
  ) {
    this.log(ctx, "Handling new user");

    try {
      await this.mirrorballService.quietAddUserToGuild(
        ctx,
        guildMember.user.id,
        guildMember.guild.id
      );
    } catch (e) {
      this.log(
        ctx,
        `Failed to log in guildMember ${guildMember.user.id} in ${guildMember.guild.id} (${e})`
      );
    }
  }

  public async handleUserLeave(
    ctx: GuildEventServiceContext,
    guildMember: GuildMember
  ) {
    this.log(ctx, "Handling user leave");

    try {
      await this.mirrorballService.quietRemoveUserFromGuild(
        ctx,
        guildMember.user.id,
        guildMember.guild.id
      );
    } catch (e) {
      this.log(
        ctx,
        `Failed to log out guildMember ${guildMember.user.id} in ${guildMember.guild.id} (${e})`
      );
    }
  }

  private async setupPermissions(ctx: GuildEventServiceContext, guild: Guild) {
    let commands = [
      { command: "permissions", dev: false },
      { command: "crowns kill", dev: false },
      { command: "crowns ban", dev: false },
      { command: "crowns banartist", dev: false },
      { command: "crowns unban", dev: false },
      { command: "crowns unbanartist", dev: false },
      { command: "scraperlastscrobbled", dev: true },
      { command: "scraperartisttoptracks", dev: true },
      { command: "scraperartisttopalbums", dev: true },
      { command: "scraperalbumtoptracks", dev: true },
    ];

    for (let commandName of commands) {
      const { command, runAs } = await this.commandRegistry.find(
        commandName.command,
        guild.id
      );

      if (command) {
        try {
          await this.adminService.disableCommand(
            ctx,
            command.id,
            runAs.toCommandFriendlyName(),
            commandName.dev
          );
        } catch (e: any) {
          this.log(
            ctx,
            `Error while setting up permissions for ${guild.name}:${e.message}`
          );
        }
      }
    }
  }

  private async pingDeveloper(
    ctx: GuildEventServiceContext,
    guild: Guild,
    leave = false
  ) {
    const developerID = ctx.client.specialUsers.developers[0].id;

    await ctx.client.client.users
      .resolve(developerID)
      ?.send(
        `Gowon just ${leave ? "left" : "joined"} ${guild.name} (${displayNumber(
          guild.memberCount,
          "member"
        )})`
      );
  }

  private async registerUsers(ctx: GuildEventServiceContext, guild: Guild) {
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
