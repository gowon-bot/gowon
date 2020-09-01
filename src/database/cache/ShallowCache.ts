export enum ShallowCacheGlobalKey {}
export enum ShallowCacheScopedKey {
  InactiveRole = "inactiveRole",
  PurgatoryRole = "purgatoryRole",
  CrownBannedUsers = "crownBannedUsers",
}
export type ShallowCacheKey = ShallowCacheGlobalKey | ShallowCacheScopedKey;

interface Cache {
  [key: string]: any;
}

export class ShallowCache {
  private cache: Cache = {};

  remember<T = any>(key: ShallowCacheGlobalKey, value: any): T;
  remember<T = any>(key: ShallowCacheScopedKey, value: any, scope: string): T;
  remember<T = any>(key: ShallowCacheKey, value: any, scope?: string): T {
    if (Object.values(ShallowCacheGlobalKey).includes(key as any)) {
      this.cache[key] = value;
    } else {
      if (!this.cache[key]) this.cache[key] = {};
      this.cache[key][scope!] = value;
    }

    return value as T;
  }

  find<T = any>(key: ShallowCacheGlobalKey): T;
  find<T = any>(key: ShallowCacheScopedKey, scope: string): T;
  find<T = any>(key: ShallowCacheKey, scope?: string): T {
    if (Object.values(ShallowCacheGlobalKey).includes(key as any)) {
      return this.cache[key] as T;
    } else {
      if (!this.cache[key]) this.cache[key] = {};
      return this.cache[key][scope!] as T;
    }
  }

  forget(key: ShallowCacheGlobalKey): void;
  forget(key: ShallowCacheScopedKey, scope: string): void;
  forget(key: ShallowCacheKey, scope?: string): void {
    if (Object.values(ShallowCacheGlobalKey).includes(key as any)) {
      delete this.cache[key];
    } else {
      if (!this.cache[key]) this.cache[key] = {};
      delete this.cache[key][scope!];
    }
  }

  async findOrRemember<T = any>(
    key: ShallowCacheGlobalKey,
    refreshser: () => Promise<any>
  ): Promise<T>;
  async findOrRemember<T = any>(
    key: ShallowCacheScopedKey,
    refreshser: () => Promise<any>,
    scope: string
  ): Promise<T>;
  async findOrRemember<T = any>(
    key: ShallowCacheKey,
    refreshser: () => Promise<any>,
    scope?: string
  ): Promise<T> {
    let value = this.find(key as any, scope!);

    if (!value) {
      let newValue = await refreshser();

      this.remember(ShallowCacheScopedKey.InactiveRole, newValue, scope!);

      value = newValue;
    }

    if (!value) this.forget(ShallowCacheScopedKey.InactiveRole, scope!);

    return value || undefined;
  }
}
