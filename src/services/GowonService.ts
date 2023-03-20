import { Guild } from "discord.js";
import regexEscape from "escape-string-regexp";
import config from "../../config.json";
import { GowonCache } from "../database/cache/GowonCache";
import { CacheScopedKey } from "../database/cache/ShallowCache";
import { ArtistCrownBan } from "../database/entity/ArtistCrownBan";
import { CrownBan } from "../database/entity/CrownBan";
import { userMentionAtStartRegex } from "../helpers/discord";
import { GowonContext } from "../lib/context/Context";
import { SettingsService } from "../lib/settings/SettingsService";
import { BaseService } from "./BaseService";
import { ServiceRegistry } from "./ServicesRegistry";

export const gowonServiceConstants = {} as const;

export class GowonService extends BaseService {
  public cache = new GowonCache();

  constants = gowonServiceConstants;

  private get settingsService() {
    return ServiceRegistry.get(SettingsService);
  }

  public prefix(guildID: string): string {
    return (
      this.settingsService.get("prefix", { guildID }) || config.defaultPrefix
    );
  }

  public regexSafePrefix(serverID: string): string {
    return regexEscape(this.prefix(serverID));
  }

  public prefixAtStartOfMessageRegex(guildID: string): RegExp {
    return new RegExp(`^${this.regexSafePrefix(guildID)}[^\\s]+`, "i");
  }

  public removeCommandName(ctx: GowonContext, string: string): string {
    return string
      .replace(
        new RegExp(
          `${this.regexSafePrefix(
            ctx.requiredGuild.id
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

  async getCrownBannedUsers(guild: Guild): Promise<string[]> {
    return await this.cache.findOrRemember<string[]>(
      CacheScopedKey.CrownBannedUsers,
      async () => {
        const bans = (await CrownBan.findBy({ serverID: guild.id })).map(
          (u) => u.user.discordID
        );

        return bans;
      },
      guild.id
    );
  }

  async isUserCrownBanned(guild: Guild, discordID: string): Promise<boolean> {
    return (await this.getCrownBannedUsers(guild)).includes(discordID);
  }

  async getCrownBannedArtists(guild: Guild): Promise<string[]> {
    return await this.cache.findOrRemember<string[]>(
      CacheScopedKey.CrownBannedArtists,
      async () => {
        const bans = (await ArtistCrownBan.findBy({ serverID: guild.id })).map(
          (u) => u.artistName
        );

        return bans;
      },
      guild.id
    );
  }

  async isArtistCrownBanned(
    guild: Guild,
    artistName: string
  ): Promise<boolean> {
    return (await this.getCrownBannedArtists(guild))
      .map((a) => a.toLowerCase())
      .includes(artistName.toLowerCase());
  }
}
