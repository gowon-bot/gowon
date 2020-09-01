import regexEscape from "escape-string-regexp";
import { RunAs } from "../lib/AliasChecker";
import { Setting } from "../database/entity/Setting";
import { Guild } from "discord.js";
import { Settings } from "../lib/Settings";
import config from "../../config.json";
import {
  ShallowCache,
  ShallowCacheScopedKey,
} from "../database/cache/ShallowCache";
import { CrownBan } from "../database/entity/CrownBan";

export class GowonService {
  // Static methods/properties
  private static instance: GowonService;

  private constructor() {}

  static getInstance(): GowonService {
    if (!this.instance) {
      this.instance = new GowonService();
    }
    return this.instance;
  }

  // Instance methods/properties
  prefix: string = config.prefix;
  customPrefixes = {
    lastfm: "lfm:",
  };

  shallowCache = new ShallowCache();

  contants = {
    hardPageLimit: 5,
    crownThreshold: 30,
  };

  get regexSafePrefix(): string {
    return regexEscape(this.prefix);
  }

  removeCommandName(string: string, runAs: RunAs): string {
    return string.replace(
      new RegExp(`${this.regexSafePrefix}${runAs.toRegexString()}`, "i"),
      ""
    );
  }

  async getInactiveRole(guild: Guild): Promise<string | undefined> {
    return await this.shallowCache.findOrRemember(
      ShallowCacheScopedKey.InactiveRole,
      async () =>
        (await Setting.getByName(Settings.InactiveRole, guild.id))?.value,
      guild.id
    );
  }

  async getPurgatoryRole(guild: Guild): Promise<string | undefined> {
    return await this.shallowCache.findOrRemember(
      ShallowCacheScopedKey.PurgatoryRole,
      async () =>
        (await Setting.getByName(Settings.PurgatoryRole, guild.id))?.value,
      guild.id
    );
  }

  async getCrownBannedUsers(guild: Guild): Promise<string[]> {
    return await this.shallowCache.findOrRemember<string[]>(
      ShallowCacheScopedKey.CrownBannedUsers,
      async () => {
        let bans = (
          await CrownBan.find({
            where: { serverID: guild.id },
          })
        ).map((u) => u.user.discordID);

        return bans;
      },
      guild.id
    );
  }

  async isUserCrownBanned(guild: Guild, discordID: string): Promise<boolean> {
    console.log(await this.getCrownBannedUsers(guild), discordID)
    return (await this.getCrownBannedUsers(guild)).includes(discordID);
  }
}
