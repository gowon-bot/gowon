import { formatDistance, fromUnixTime } from "date-fns";
import { PM2ConnectionError } from "../../errors";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { PM2Service } from "../../services/PM2Service";

export default class Uptime extends BaseCommand {
  idSeed = "gfriend yuju";

  description = "Show's the bots uptime";
  secretCommand = true;
  devCommand = true;

  pm2Service = new PM2Service(this.logger);

  async run() {
    if (!this.gowonClient.hasPM2) throw new PM2ConnectionError();

    let description = await this.pm2Service.describe();

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
