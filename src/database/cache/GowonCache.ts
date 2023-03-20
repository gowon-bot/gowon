import { CacheScopedKey, ShallowCache } from "./ShallowCache";

export class GowonCache extends ShallowCache {
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
}
