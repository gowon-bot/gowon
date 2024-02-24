import { CannotChangePrefixError } from "../../errors/commands/permissions";
import { OmitTriangularBracketsFromPrefixError } from "../../errors/gowon";
import { code } from "../../helpers/discord";
import { Command } from "../../lib/command/Command";
import { SettingsService } from "../../lib/settings/SettingsService";
import { InfoEmbed } from "../../lib/ui/embeds/InfoEmbed";
import { SuccessEmbed } from "../../lib/ui/embeds/SuccessEmbed";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export default class Prefix extends Command {
  idSeed = "apink hayoung";

  description = "Set or view the prefix";
  secretCommand = true;
  shouldBeIndexed = false;
  guildRequired = true;

  newPrefix?: string;

  settingsService = ServiceRegistry.get(SettingsService);

  setPrefix(prefix?: string): Prefix {
    this.newPrefix = prefix;
    return this;
  }

  async run() {
    if (this.newPrefix) {
      if (
        !this.ctx.requiredAuthorMember.permissions.has("ADMINISTRATOR") &&
        !this.gowonClient.isDeveloper(this.author.id)
      ) {
        throw new CannotChangePrefixError();
      }

      if (this.newPrefix.startsWith("<") && this.newPrefix.endsWith(">")) {
        throw new OmitTriangularBracketsFromPrefixError();
      }

      await this.settingsService.set(
        this.ctx,
        "prefix",
        this.scopes.guild,
        this.newPrefix
      );

      const embed = new SuccessEmbed().setDescription(
        `The new prefix is ${code(this.prefix)}`
      );

      await this.reply(embed);
    } else {
      const embed = new InfoEmbed().setDescription(
        `The current prefix is ${code(this.prefix)}`
      );

      await this.reply(embed);
    }
  }
}
