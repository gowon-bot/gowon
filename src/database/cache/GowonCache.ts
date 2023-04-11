import { IsNull } from "typeorm";
import { TagBan } from "../entity/TagBan";
import { CacheKey, CacheScopedKey, ShallowCache } from "./ShallowCache";

export class GowonCache extends ShallowCache {
  async seedAll(): Promise<void> {
    await Promise.all([this.seedGlobalBannedTags()]);
  }

  // Crown bans

  public addCrownBan(serverID: string, discordID: string): void {
    const bans = [
      ...(this.find(CacheScopedKey.CrownBannedUsers, serverID) || []),
      discordID,
    ];

    this.remember(CacheScopedKey.CrownBannedUsers, bans, serverID);
  }

  public removeCrownBan(serverID: string, discordID: string): void {
    const bans = (
      this.find<string[]>(CacheScopedKey.CrownBannedUsers, serverID) || []
    ).filter((u) => u !== discordID);

    this.remember(CacheScopedKey.CrownBannedUsers, bans, serverID);
  }

  public addCrownArtistBan(serverID: string, artistName: string): void {
    const bans = [
      ...(this.find(CacheScopedKey.CrownBannedArtists, serverID) || []),
      artistName,
    ];

    this.remember(CacheScopedKey.CrownBannedArtists, bans, serverID);
  }

  public removeCrownArtistBan(serverID: string, artistName: string): void {
    const bans = (
      this.find<string[]>(CacheScopedKey.CrownBannedArtists, serverID) || []
    ).filter((a) => a !== artistName);

    this.remember(CacheScopedKey.CrownBannedArtists, bans, serverID);
  }

  // Tag bans

  public async seedGlobalBannedTags(): Promise<void> {
    const tagBans = await TagBan.findBy({ serverID: IsNull() });

    const regexs = tagBans.filter((tb) => tb.isRegex);
    const strings = tagBans.filter((tb) => !tb.isRegex);

    this.remember(
      CacheKey.GlobalTagBans,
      strings.map(({ tag }) => tag)
    );

    this.remember(
      CacheKey.GlobalTagBanRegexs,
      regexs.map((tb) => tb.asRegex())
    );
  }

  public addGlobalBannedTag(tagBan: TagBan): void {
    if (tagBan.isRegex) {
      const bans = [
        ...(this.find<RegExp[]>(CacheKey.GlobalTagBanRegexs) || []),
        tagBan.asRegex(),
      ];

      this.remember(CacheKey.GlobalTagBanRegexs, bans);
    } else {
      const bans = [
        ...(this.find<string[]>(CacheKey.GlobalTagBans) || []),
        tagBan.tag,
      ];

      this.remember(CacheKey.GlobalTagBans, bans);
    }
  }

  public removeGlobalBannedTag(tagBan: TagBan): void {
    if (tagBan.isRegex) {
      const bans = this.find<RegExp[]>(CacheKey.GlobalTagBanRegexs).filter(
        (t) => t.toString() !== tagBan.asRegex().toString()
      );

      this.remember(CacheKey.GlobalTagBanRegexs, bans);
    } else {
      const bans = this.find<string[]>(CacheKey.GlobalTagBans).filter(
        (t) => t !== tagBan.tag
      );

      this.remember(CacheKey.GlobalTagBans, bans);
    }
  }

  public getGlobalBannedTags(): { strings: string[]; regexs: RegExp[] } {
    const strings = this.find(CacheKey.GlobalTagBans) ?? [];
    const regexs = this.find(CacheKey.GlobalTagBanRegexs) ?? [];

    return { strings, regexs };
  }
}
