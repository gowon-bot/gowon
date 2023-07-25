import { Guild } from "discord.js";
import regexEscape from "escape-string-regexp";
import config from "../../config.json";
import { GowonCache } from "../database/cache/GowonCache";
import { userMentionAtStartRegex } from "../helpers/discord";
import { GowonContext } from "../lib/context/Context";
import { SettingsService } from "../lib/settings/SettingsService";
import { BaseService } from "./BaseService";
import { ServiceRegistry } from "./ServicesRegistry";

export class GowonService extends BaseService {
  public cache = new GowonCache();

  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }

  public prefix(guildID?: string): string {
    if (!guildID) return config.defaultPrefix;

    return (
      this.settingsService.get("prefix", { guildID }) || config.defaultPrefix
    );
  }

  public regexSafePrefix(serverID?: string): string {
    return regexEscape(this.prefix(serverID));
  }

  public prefixAtStartOfMessageRegex(guildID?: string): RegExp {
    return new RegExp(`^${this.regexSafePrefix(guildID)}[^\\s]+`, "i");
  }

  public removeCommandName(ctx: GowonContext, string: string): string {
    return string
      .replace(
        new RegExp(
          `${this.regexSafePrefix(
            ctx.guild?.id
          )}${ctx.extract.asRemovalRegexString()}`,
          "i"
        ),
        ""
      )
      .replace(
        new RegExp(
          `${
            userMentionAtStartRegex(ctx.botUser.id).source
          }\\s+${ctx.extract.asRemovalRegexString()}`,
          "i"
        ),
        ""
      )
      .trim();
  }

  async getInactiveRole(guild: Guild): Promise<string | undefined> {
    return this.settingsService.get("inactiveRole", { guildID: guild.id });
  }

  async getPurgatoryRole(guild: Guild): Promise<string | undefined> {
    return this.settingsService.get("purgatoryRole", { guildID: guild.id });
  }
}
