import { PermissionsBitField } from "discord.js";
import { CannotChangePrefixError } from "../../errors/commands/permissions";
import { LogicError } from "../../errors/errors";
import { code } from "../../helpers/discord";
import { Command } from "../../lib/command/Command";
import { SettingsService } from "../../lib/settings/SettingsService";
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
        !this.ctx.requiredAuthorMember.permissions.has(
          PermissionsBitField.Flags.Administrator
        ) &&
        !this.gowonClient.isDeveloper(this.author.id)
      ) {
        throw new CannotChangePrefixError();
      }

      if (this.newPrefix.startsWith("<") && this.newPrefix.endsWith(">"))
        throw new LogicError(
          "Please omit the triangular brackets!\neg. `@Gowon prefix <!>` should be `@Gowon prefix !`"
        );

      await this.settingsService.set(
        this.ctx,
        "prefix",
        this.scopes.guild,
        this.newPrefix
      );
      await this.oldReply(`the new prefix is ${code(this.prefix)}`);
    } else {
      await this.oldReply(`the prefix is ${code(this.prefix)}`);
    }
  }
}
