import { LogicError } from "../../errors/errors";
import { CannotChangePrefixError } from "../../errors/permissions";
import { code } from "../../helpers/discord";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { SettingsService } from "../../lib/settings/SettingsService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export default class Prefix extends BaseCommand {
  idSeed = "apink hayoung";

  description = "Set or view the prefix";
  secretCommand = true;
  shouldBeIndexed = false;

  newPrefix?: string;

  settingsService = ServiceRegistry.get(SettingsService);

  setPrefix(prefix?: string): Prefix {
    this.newPrefix = prefix;
    return this;
  }

  async run() {
    if (this.newPrefix) {
      if (
        !this.ctx.authorMember.permissions.has("ADMINISTRATOR") &&
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
