import { Command } from "../../../lib/command/Command";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

export default class NoTwitter extends Command {
  idSeed = "viviz umji";

  description = "Ratio this";
  subcategory = "developer";
  secretCommand = true;
  devCommand = true;
  archived = true;

  settingsService = ServiceRegistry.get(SettingsService);

  async run() {}
}
