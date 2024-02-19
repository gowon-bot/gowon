import config from "../../../../config.json";
import { bold } from "../../../helpers/discord";
import { InfoEmbed } from "../../../lib/ui/embeds/InfoEmbed";
import { SettingsChildCommand } from "./SettingsChildCommand";

export class Guild extends SettingsChildCommand {
  idSeed = "kep1er dayeon";

  description = "Links you to the guild settings for the current guild";
  usage = [""];

  aliases = ["server", "guildsettings", "serversettings"];

  slashCommand = true;
  adminCommand = true;
  guildRequired = true;

  async run() {
    const embed = new InfoEmbed().setDescription(
      `The guild settings for ${bold(
        this.requiredGuild.name
      )} can be found at:\n${
        config.gowonWebsiteURL +
        `/dashboard/settings/guild/${this.requiredGuild.id}`
      }`
    );

    await this.reply(embed);
  }
}
