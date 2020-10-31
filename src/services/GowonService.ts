import regexEscape from "escape-string-regexp";
import { RunAs } from "../lib/AliasChecker";
import { Setting } from "../database/entity/Setting";
import { Guild } from "discord.js";
import { Settings } from "../lib/Settings";
import config from "../../config.json";
import { ShallowCache, CacheScopedKey } from "../database/cache/ShallowCache";
import { CrownBan } from "../database/entity/CrownBan";
import { ChannelBlacklist } from "../database/entity/ChannelBlacklist";

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
  // prefix: string = config.prefix;
  customPrefixes = {
    lastfm: "lfm:",
  };

  shallowCache = new ShallowCache();

  constants = {
    hardPageLimit: 5,
    crownThreshold: 30,
    dateParsers: [
      "yy-MM-dd",
      "yyyy-MM-dd",
      "yy/MM/dd",
      "yyyy/MM/dd",
      "yy.MM.dd",
      "yyyy.MM.dd",
    ],
    unknownUserDisplay: "<unknown user>"
  } as const;

  async init() {
    let prefixes = await Setting.find({ where: { name: Settings.Prefix } });
    for (let prefix of prefixes) {
      this.shallowCache.remember(
        CacheScopedKey.Prefixes,
        prefix.value,
        prefix.scope!
      );
    }
  }

  async prefix(serverID: string): Promise<string> {
    return await this.shallowCache.findOrRemember(
      CacheScopedKey.Prefixes,
      async () =>
        (await Setting.getByName(Settings.Prefix, serverID))?.value ||
        config.defaultPrefix,
      serverID
    );
  }

  async setPrefix(serverID: string, prefix: string): Promise<string> {
    await Setting.createUpdateOrDelete(Settings.Prefix, serverID, prefix);
    return this.shallowCache.remember(
      CacheScopedKey.Prefixes,
      prefix,
      serverID
    );
  }

  async regexSafePrefix(serverID: string): Promise<string> {
    return regexEscape(await this.prefix(serverID));
  }

  async removeCommandName(
    string: string,
    runAs: RunAs,
    serverID: string
  ): Promise<string> {
    return string.replace(
      new RegExp(
        `${await this.regexSafePrefix(serverID)}${runAs.toRegexString()}`,
        "i"
      ),
      ""
    );
  }

  async getInactiveRole(guild: Guild): Promise<string | undefined> {
    return await this.shallowCache.findOrRemember(
      CacheScopedKey.InactiveRole,
      async () =>
        (await Setting.getByName(Settings.InactiveRole, guild.id))?.value,
      guild.id
    );
  }

  async getPurgatoryRole(guild: Guild): Promise<string | undefined> {
    return await this.shallowCache.findOrRemember(
      CacheScopedKey.PurgatoryRole,
      async () =>
        (await Setting.getByName(Settings.PurgatoryRole, guild.id))?.value,
      guild.id
    );
  }

  async getCrownBannedUsers(guild: Guild): Promise<string[]> {
    return await this.shallowCache.findOrRemember<string[]>(
      CacheScopedKey.CrownBannedUsers,
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
    return (await this.getCrownBannedUsers(guild)).includes(discordID);
  }

  async getChannelBlacklists(serverID: string): Promise<ChannelBlacklist[]> {
    return await this.shallowCache.findOrRemember(
      CacheScopedKey.ChannelBlacklists,
      async () => await ChannelBlacklist.find({ serverID }),
      serverID
    );
  }
}
