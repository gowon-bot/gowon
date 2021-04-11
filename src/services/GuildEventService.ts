import { Guild, GuildMember } from "discord.js";
import { numberDisplay } from "../helpers";
import { CommandManager } from "../lib/command/CommandManager";
import { GowonClient } from "../lib/GowonClient";
import { Logger } from "../lib/Logger";
import { BaseService } from "./BaseService";
import { AdminService } from "./dbservices/AdminService";
import { GowonService } from "./GowonService";
import { IndexingService } from "./indexing/IndexingService";

export class GuildEventService extends BaseService {
  gowonService = GowonService.getInstance();
  adminService = new AdminService(this.gowonClient);
  commandManager = new CommandManager();
  indexingService = new IndexingService();

  constructor(private gowonClient: GowonClient, logger?: Logger) {
    super(logger);
  }

  async init() {
    await this.commandManager.init();
  }

  public async handleNewGuild(guild: Guild) {
    this.log(`setting up Gowon for ${guild.name}`);

    await this.setupPermissions(guild);
    await this.pingDeveloper(guild);
  }

  public async handleNewUser(guildMember: GuildMember) {
    this.log("Handling new user");
    try {
      await this.indexingService.quietAddUserToGuild(
        guildMember.user.id,
        guildMember.guild.id
      );
    } catch (e) {
      this.log(
        `Failed to log in guildMember ${guildMember.user.id} in ${guildMember.guild.id} (${e})`
      );
    }
  }

  public async handleUserLeave(guildMember: GuildMember) {
    this.log("Handling user leave");
    try {
      await this.indexingService.quietRemoveUserFromGuild(
        guildMember.user.id,
        guildMember.guild.id
      );
    } catch (e) {
      this.log(
        `Failed to log out guildMember ${guildMember.user.id} in ${guildMember.guild.id} (${e})`
      );
    }
  }

  private async setupPermissions(guild: Guild) {
    let commands = [
      { command: "permissions", dev: false },
      { command: "crowns kill", dev: false },
      { command: "lastscrobbled", dev: true },
      { command: "artisttoptracks", dev: true },
      { command: "artisttopalbums", dev: true },
      { command: "albumtoptracks", dev: true },
    ];

    for (let commandName of commands) {
      const { command, runAs } = await this.commandManager.find(
        commandName.command,
        guild.id
      );

      if (command) {
        try {
          await this.adminService.disableCommand(
            command.id,
            guild.id,
            runAs.toCommandFriendlyName(),
            commandName.dev
          );
        } catch (e) {
          this.log(
            `Error while setting up permissions for ${guild.name}:${e.message}`
          );
        }
      }
    }
  }

  private async pingDeveloper(guild: Guild) {
    const developerID = Object.keys(
      this.gowonClient.specialUsers.developers[0]
    )[0];

    await this.gowonClient.client.users
      .resolve(developerID)
      ?.send(
        `Gowon just joined ${guild.name} (${numberDisplay(
          guild.memberCount,
          "members"
        )})`
      );
  }
}
