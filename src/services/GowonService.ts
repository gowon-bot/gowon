import regexEscape from "escape-string-regexp";
import { Guild } from "discord.js";
import config from "../../config.json";
import { CacheScopedKey, ShallowCache } from "../database/cache/ShallowCache";
import { CrownBan } from "../database/entity/CrownBan";
import { ChannelBlacklist } from "../database/entity/ChannelBlacklist";
import { ArtistCrownBan } from "../database/entity/ArtistCrownBan";
import { RunAs } from "../lib/command/RunAs";
import { SettingsManager } from "../lib/settings/SettingsManager";

export class GowonService {
  // Instance methods/properties
  customPrefixes = {
    lastfm: "lfm:",
  };

  settingsManager = new SettingsManager();
  shallowCache = new ShallowCache();

  constants = {
    hardPageLimit: 10,
    crownThreshold: 30,
    dateParsers: [
      "yy-MM-dd",
      "yyyy-MM-dd",
      "yy/MM/dd",
      "yyyy/MM/dd",
      "yy.MM.dd",
      "yyyy.MM.dd",
    ],
    unknownUserDisplay: "???",
    defaultLoadingTime: 5,
  } as const;

  prefix(guildID: string): string {
    return (
      this.settingsManager.get("prefix", { guildID }) || config.defaultPrefix
    );
  }

  regexSafePrefix(serverID: string): string {
    return regexEscape(this.prefix(serverID));
  }

  removeCommandName(string: string, runAs: RunAs, serverID: string): string {
    return string.replace(
      new RegExp(
        `${this.regexSafePrefix(serverID)}${runAs.toRegexString()}`,
        "i"
      ),
      ""
    );
  }

  async getInactiveRole(guild: Guild): Promise<string | undefined> {
    return this.settingsManager.get("inactiveRole", { guildID: guild.id });
  }

  async getPurgatoryRole(guild: Guild): Promise<string | undefined> {
    return this.settingsManager.get("purgatoryRole", { guildID: guild.id });
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

  async getCrownBannedArtists(guild: Guild): Promise<string[]> {
    return await this.shallowCache.findOrRemember<string[]>(
      CacheScopedKey.CrownBannedArtists,
      async () => {
        let bans = (
          await ArtistCrownBan.find({
            where: { serverID: guild.id },
          })
        ).map((u) => u.artistName);

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
