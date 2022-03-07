import { formatDistance, fromUnixTime } from "date-fns";
import { PM2ConnectionError } from "../../errors/errors";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { PM2Service } from "../../services/PM2Service";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export default class Uptime extends BaseCommand {
  idSeed = "gfriend yuju";

  description = "Show's the bots uptime";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;

  pm2Service = ServiceRegistry.get(PM2Service);

  async run() {
    if (!this.gowonClient.hasPM2) throw new PM2ConnectionError();

    let description = await this.pm2Service.describe(this.ctx);

    if (!description.pm2_env?.pm_uptime) throw new PM2ConnectionError();

    let embed = this.newEmbed()
      .setTitle("Gowon's uptime")
      .setDescription(
        `Gowon has been up for ${formatDistance(
          fromUnixTime(description.pm2_env.pm_uptime / 1000),
          new Date()
        )}`
      );

    await this.send(embed);
  }
}
