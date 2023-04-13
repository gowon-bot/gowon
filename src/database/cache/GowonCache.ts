import { IsNull } from "typeorm";
import { TagBan } from "../entity/TagBan";
import { GlobalCacheKey, ShallowCache } from "./ShallowCache";

export class GowonCache extends ShallowCache {
  async seedAll(): Promise<void> {
    await Promise.all([this.seedGlobalBannedTags()]);
  }

  // Tag bans

  public async seedGlobalBannedTags(): Promise<void> {
    const tagBans = await TagBan.findBy({ serverID: IsNull() });

    const regexs = tagBans.filter((tb) => tb.isRegex);
    const strings = tagBans.filter((tb) => !tb.isRegex);

    this.store(
      GlobalCacheKey.GlobalTagBans,
      strings.map(({ tag }) => tag)
    );

    this.store(
      GlobalCacheKey.GlobalTagBanRegexs,
      regexs.map((tb) => tb.asRegex())
    );
  }

  public fetchGlobalBannedTag(tagBan: TagBan): void {
    if (tagBan.isRegex) {
      const bans = [
        ...(this.fetch<RegExp[]>(GlobalCacheKey.GlobalTagBanRegexs) || []),
        tagBan.asRegex(),
      ];

      this.store(GlobalCacheKey.GlobalTagBanRegexs, bans);
    } else {
      const bans = [
        ...(this.fetch<string[]>(GlobalCacheKey.GlobalTagBans) || []),
        tagBan.tag,
      ];

      this.store(GlobalCacheKey.GlobalTagBans, bans);
    }
  }

  public deleteGlobalBannedTag(tagBan: TagBan): void {
    if (tagBan.isRegex) {
      const bans = this.fetch<RegExp[]>(
        GlobalCacheKey.GlobalTagBanRegexs
      ).filter((t) => t.toString() !== tagBan.asRegex().toString());

      this.store(GlobalCacheKey.GlobalTagBanRegexs, bans);
    } else {
      const bans = this.fetch<string[]>(GlobalCacheKey.GlobalTagBans).filter(
        (t) => t !== tagBan.tag
      );

      this.store(GlobalCacheKey.GlobalTagBans, bans);
    }
  }

  public fetchGlobalBannedTags(): { strings: string[]; regexs: RegExp[] } {
    const strings = this.fetch(GlobalCacheKey.GlobalTagBans) ?? [];
    const regexs = this.fetch(GlobalCacheKey.GlobalTagBanRegexs) ?? [];

    return { strings, regexs };
  }
}
