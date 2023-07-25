import { sum } from "mathjs";
import { RawTag } from "../../services/LastFM/LastFMService.types";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { TagBlacklistService } from "../../services/TagBlacklistService";
import { LilacTag } from "../../services/lilac/LilacAPIService.types";
import { GowonContext } from "../context/Context";

function isLilacTag(tag: any | LilacTag): tag is LilacTag {
  return !!tag.name && !!tag.occurrences;
}

export class TagConsolidator {
  get tagBlacklistService() {
    return ServiceRegistry.get(TagBlacklistService);
  }

  static readonly tagJoin = " ‧ ";

  customBlacklist = [] as string[];
  tags: LilacTag[] = [];
  characterLimit = 30;

  blacklistTags(...nonTags: string[]): TagConsolidator {
    this.customBlacklist.push(...nonTags);
    return this;
  }

  hasAnyTags(): boolean {
    return !!this.tags.length;
  }

  async saveServerBannedTagsInContext(ctx: GowonContext) {
    await this.tagBlacklistService.saveServerBannedTagsInContext(ctx);
  }

  addTags(
    ctx: GowonContext,
    tags: RawTag[] | string[] | LilacTag[]
  ): TagConsolidator {
    const convertedTags = this.convertTags(tags);

    this.tags.push(...this.filterTags(ctx, convertedTags));
    return this;
  }

  consolidate(max: number = Infinity, useCharacterLimit = true): LilacTag[] {
    let { fixer, reverser } = TagConsolidator.tagFixer();

    let tagCounts = this.tags.reduce((acc, tag) => {
      let fixedTagName = fixer(tag);

      if (!acc[fixedTagName]) acc[fixedTagName] = 0;

      acc[fixedTagName] += tag.occurrences || 1;

      return acc;
    }, {} as { [tagName: string]: number });

    return Object.keys(tagCounts)
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .map((t) => reverser(t))
      .filter((t) => !useCharacterLimit || t.name.length <= this.characterLimit)
      .slice(0, max);
  }

  consolidateAsStrings(
    max: number = Infinity,
    useCharacterLimit = true
  ): string[] {
    return this.consolidate(max, useCharacterLimit).map((t) => t.name);
  }

  hasTag(...tags: string[]): boolean {
    for (let tag of tags) {
      if (this.consolidateAsStrings().includes(tag)) return true;
    }

    return false;
  }

  static tagFixer(): {
    fixer: (tag: LilacTag) => string;
    reverser: (tag: string) => LilacTag;
  } {
    const tagMap: { [fixedTag: string]: { [tag: string]: number } } = {};

    function fixer(tag: LilacTag): string {
      const tagName = tag.name;
      const fixedTag = tag.name.replace(/ |-|_|'/g, "").toLowerCase();

      if (!tagMap[fixedTag]) tagMap[fixedTag] = {};
      if (!tagMap[fixedTag][tagName]) tagMap[fixedTag][tagName] = 0;

      tagMap[fixedTag][tagName] += tag.occurrences || 1;

      return fixedTag;
    }

    function reverser(fixedTag: string): LilacTag {
      const foundTag = Object.keys(tagMap[fixedTag]).sort(
        (a, b) => tagMap[fixedTag][b] - tagMap[fixedTag][a]
      )[0];

      if (foundTag) {
        return {
          name: foundTag,
          occurrences: sum(Object.values(tagMap[fixedTag])),
        };
      }

      return { name: fixedTag, occurrences: 1 };
    }

    return { reverser, fixer };
  }

  private filterTags(ctx: GowonContext, tags: LilacTag[]): LilacTag[] {
    return this.tagBlacklistService.filter(ctx, tags, this.customBlacklist);
  }

  private convertTags(tags: (string | RawTag | LilacTag)[]): LilacTag[] {
    const convertedTags = [] as LilacTag[];

    for (const tag of tags) {
      if (isLilacTag(tag)) {
        convertedTags.push({
          name: tag.name.toLowerCase(),
          occurrences: tag.occurrences,
        });
      } else if (typeof tag === "string") {
        convertedTags.push({ name: tag.toLowerCase(), occurrences: 1 });
      } else {
        convertedTags.push({ name: tag.name.toLowerCase(), occurrences: 1 });
      }
    }

    return convertedTags;
  }
}
