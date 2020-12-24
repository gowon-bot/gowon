import { Guild } from "discord.js";
import { CommandManager } from "../lib/command/CommandManager";
import { GowonClient } from "../lib/GowonClient";
import { BaseService } from "./BaseService";
import { AdminService } from "./dbservices/AdminService";
import { GowonService } from "./GowonService";

export class GuildSetupService extends BaseService {
  gowonService = GowonService.getInstance();
  adminService = new AdminService(this.gowonClient);
  commandManager = new CommandManager();

  constructor(private gowonClient: GowonClient) {
    super();
  }

  async init() {
    await this.commandManager.init();
  }

  async handleNewGuild(guild: Guild) {
    this.log(`setting up Gowon for ${guild.name}`);

    await this.setupPermissions(guild);
    await this.pingDeveloper(guild);
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
      ?.send(`Gowon just joined ${guild.name}`);
  }
}
