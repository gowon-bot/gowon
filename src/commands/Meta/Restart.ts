import { PM2ConnectionError } from "../../errors/errors";
import { Command } from "../../lib/command/Command";
import { PM2Service } from "../../services/PM2Service";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export default class Restart extends Command {
  idSeed = "gfriend yerin";
  description = "Restart the bot";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;

  pm2Service = ServiceRegistry.get(PM2Service);

  async run() {
    if (!this.gowonClient.hasPM2) throw new PM2ConnectionError();

    await this.oldReply("restarting...");
    this.pm2Service.restart(this.ctx);
  }
}
