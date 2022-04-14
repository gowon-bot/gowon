import { bold } from "../../helpers/discord";
import { Command } from "../../lib/command/Command";
import { toggleValues } from "../../lib/settings/Settings";
import { SettingsService } from "../../lib/settings/SettingsService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export default class IssueMode extends Command {
  idSeed = "billlie suhyeon";

  description = "Toggles issue mode";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;

  settingsService = ServiceRegistry.get(SettingsService);

  async run() {
    const issueMode = this.settingsService.get("issueMode", {});

    await this.settingsService.set(
      this.ctx,
      "issueMode",
      {},
      issueMode === "true" ? "false" : "true"
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Issue mode"))
      .setDescription(
        `Issue mode is now ${bold(
          issueMode === "true" ? toggleValues.OFF : toggleValues.ON
        )}`
      );

    await this.send(embed);
  }
}
