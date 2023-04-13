import { SimpleMap } from "../../helpers/types";

export enum GlobalCacheKey {
  GlobalTagBans = "globalTagBans",
  GlobalTagBanRegexs = "globalTagBanRegexs",
}
export enum ScopedCacheKey {}

export type ShallowCacheKey = GlobalCacheKey | ScopedCacheKey;

function isScoped(key: GlobalCacheKey | ScopedCacheKey): key is ScopedCacheKey {
  return Object.values(ScopedCacheKey).includes(key as any);
}

export class ShallowCache {
  private cache: SimpleMap = {};

  store<T = any>(key: GlobalCacheKey, value: any): T;
  store<T = any>(key: ScopedCacheKey, value: any, scope: string): T;
  store<T = any>(key: ShallowCacheKey, value: any, scope?: string): T {
    if (isScoped(key)) {
      if (!this.cache[key]) this.cache[key] = {};
      this.cache[key][scope!] = value;
    } else {
      this.cache[key] = value;
    }

    return value as T;
  }

  fetch<T = any>(key: GlobalCacheKey): T;
  fetch<T = any>(key: ScopedCacheKey, scope: string): T;
  fetch<T = any>(key: ShallowCacheKey, scope?: string): T {
    if (isScoped(key)) {
      if (!this.cache[key]) this.cache[key] = {};
      return this.cache[key][scope!] as T;
    } else {
      return this.cache[key] as T;
    }
  }
}
