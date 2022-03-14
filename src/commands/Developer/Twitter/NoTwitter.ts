import { BaseCommand } from "../../../lib/command/BaseCommand";
import { toggleValues } from "../../../lib/settings/Settings";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

export default class NoTwitter extends BaseCommand {
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
        `Gowon's Twitter integration is now ${(noTwitter === toggleValues.ON
          ? toggleValues.ON
          : toggleValues.OFF
        ).strong()}`
      );

    await this.send(embed);
  }
}
