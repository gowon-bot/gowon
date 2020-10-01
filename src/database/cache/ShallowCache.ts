export enum CacheKey {}
export enum CacheScopedKey {
  InactiveRole = "inactiveRole",
  PurgatoryRole = "purgatoryRole",
  CrownBannedUsers = "crownBannedUsers",
  Prefixes = "prefixes",
  ChannelBlacklists = "channelBlacklists"
}
export type ShallowCacheKey = CacheKey | CacheScopedKey;

interface Cache {
  [key: string]: any;
}

export class ShallowCache {
  private cache: Cache = {};

  remember<T = any>(key: CacheKey, value: any): T;
  remember<T = any>(key: CacheScopedKey, value: any, scope: string): T;
  remember<T = any>(key: ShallowCacheKey, value: any, scope?: string): T {
    if (Object.values(CacheKey).includes(key as any)) {
      this.cache[key] = value;
    } else {
      if (!this.cache[key]) this.cache[key] = {};
      this.cache[key][scope!] = value;
    }

    return value as T;
  }

  find<T = any>(key: CacheKey): T;
  find<T = any>(key: CacheScopedKey, scope: string): T;
  find<T = any>(key: ShallowCacheKey, scope?: string): T {
    if (Object.values(CacheKey).includes(key as any)) {
      return this.cache[key] as T;
    } else {
      if (!this.cache[key]) this.cache[key] = {};
      return this.cache[key][scope!] as T;
    }
  }

  forget(key: CacheKey): void;
  forget(key: CacheScopedKey, scope: string): void;
  forget(key: ShallowCacheKey, scope?: string): void {
    if (Object.values(CacheKey).includes(key as any)) {
      delete this.cache[key];
    } else {
      if (!this.cache[key]) this.cache[key] = {};
      delete this.cache[key][scope!];
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

      this.remember(CacheScopedKey.InactiveRole, newValue, scope!);

      value = newValue;
    }

    if (!value) this.forget(CacheScopedKey.InactiveRole, scope!);

    return value || undefined;
  }
}
