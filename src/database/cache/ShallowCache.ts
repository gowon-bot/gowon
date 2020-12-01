export enum CacheKey {}
export enum CacheScopedKey {
  InactiveRole = "inactiveRole",
  PurgatoryRole = "purgatoryRole",
  CrownBannedUsers = "crownBannedUsers",
  CrownBannedArtists = "crownBannedArtists",
  Prefixes = "prefixes",
  ChannelBlacklists = "channelBlacklists",
}
export type ShallowCacheKey = CacheKey | CacheScopedKey;

interface Cache {
  [key: string]: any;
}

function isScoped(key: CacheKey | CacheScopedKey): key is CacheScopedKey {
  return Object.values(CacheScopedKey).includes(key as any);
}

export class ShallowCache {
  private cache: Cache = {};

  remember<T = any>(key: CacheKey, value: any): T;
  remember<T = any>(key: CacheScopedKey, value: any, scope: string): T;
  remember<T = any>(key: ShallowCacheKey, value: any, scope?: string): T {
    if (isScoped(key)) {
      if (!this.cache[key]) this.cache[key] = {};
      this.cache[key][scope!] = value;
    } else {
      this.cache[key] = value;
    }

    return value as T;
  }

  find<T = any>(key: CacheKey): T;
  find<T = any>(key: CacheScopedKey, scope: string): T;
  find<T = any>(key: ShallowCacheKey, scope?: string): T {
    if (isScoped(key)) {
      if (!this.cache[key]) this.cache[key] = {};
      return this.cache[key][scope!] as T;
    } else {
      return this.cache[key] as T;
    }
  }

  forget(key: CacheKey): void;
  forget(key: CacheScopedKey, scope: string): void;
  forget(key: ShallowCacheKey, scope?: string): void {
    if (isScoped(key)) {
      if (!this.cache[key]) this.cache[key] = {};
      delete this.cache[key][scope!];
    } else {
      delete this.cache[key];
    }
  }

  async findOrRemember<T = any>(
    key: CacheKey,
    refreshser: () => Promise<T>
  ): Promise<T>;
  async findOrRemember<T = any>(
    key: CacheScopedKey,
    refreshser: () => Promise<T>,
    scope: string
  ): Promise<T>;
  async findOrRemember<T = any>(
    key: ShallowCacheKey,
    refreshser: () => Promise<T>,
    scope?: string
  ): Promise<T> {
    let value = this.find(key as any, scope!);

    if (!value) {
      let newValue = await refreshser();

      if (isScoped(key)) {
        this.remember(key, newValue, scope!);
      } else {
        this.remember(key, newValue);
      }

      value = newValue;
    }

    if (!value) {
      if (isScoped(key)) {
        this.forget(key, scope!);
      } else {
        this.forget(key);
      }
    }

    return value || undefined;
  }
}
