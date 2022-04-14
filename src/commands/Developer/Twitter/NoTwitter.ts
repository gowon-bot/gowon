import { bold } from "../../../helpers/discord";
import { Command } from "../../../lib/command/Command";
import { toggleValues } from "../../../lib/settings/Settings";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

export default class NoTwitter extends Command {
  idSeed = "viviz umji";

  description = "Ratio this";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;

  settingsService = ServiceRegistry.get(SettingsService);

  async run() {
    const noTwitter = this.settingsService.get("noTwitter", {});

    await this.settingsService.set(
      this.ctx,
      "noTwitter",
      {},
      noTwitter === toggleValues.ON ? toggleValues.OFF : toggleValues.ON
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("No twitter"))
      .setDescription(
        `Gowon's Twitter integration is now ${bold(
          noTwitter === toggleValues.ON ? toggleValues.ON : toggleValues.OFF
        )}`
      );

    await this.send(embed);
  }
}
