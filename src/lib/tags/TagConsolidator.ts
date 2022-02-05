import { sum } from "mathjs";
import { RawTag } from "../../services/LastFM/LastFMService.types";
import { MirrorballTag } from "../../services/mirrorball/MirrorballTypes";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { WordBlacklistService } from "../../services/WordBlacklistService";
import { GowonContext } from "../context/Context";

function isMirrorballTag(tag: any | MirrorballTag): tag is MirrorballTag {
  return !!tag.name && !!tag.occurrences;
}

export class TagConsolidator {
  get wordBlacklistService() {
    return ServiceRegistry.get(WordBlacklistService);
  }

  static readonly tagJoin = " ‧ ";

  customBlacklist = [] as string[];
  tags: MirrorballTag[] = [];
  characterLimit = 30;

  blacklistTags(...nonTags: string[]): TagConsolidator {
    this.customBlacklist.push(...nonTags);
    return this;
  }

  hasAnyTags(): boolean {
    return !!this.tags.length;
  }

  async saveServerBannedTagsInContext(ctx: GowonContext) {
    await this.wordBlacklistService.saveServerBannedTagsInContext(ctx);
  }

  addTags(
    ctx: GowonContext,
    tags: RawTag[] | string[] | MirrorballTag[]
  ): TagConsolidator {
    const convertedTags = this.convertTags(tags);

    this.tags.push(...this.filterTags(ctx, convertedTags));
    return this;
  }

  consolidate(
    max: number = Infinity,
    useCharacterLimit = true
  ): MirrorballTag[] {
    let { fixer, reverser } = TagConsolidator.tagFixer();

    let tagCounts = this.tags.reduce((acc, tag) => {
      let fixedTagName = fixer(tag);

      if (!acc[fixedTagName]) acc[fixedTagName] = 0;

      acc[fixedTagName] += tag.occurrences;

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
    fixer: (tag: MirrorballTag) => string;
    reverser: (tag: string) => MirrorballTag;
  } {
    const tagMap: { [fixedTag: string]: { [tag: string]: number } } = {};

    function fixer(tag: MirrorballTag): string {
      const tagName = tag.name;
      const fixedTag = tag.name.replace(/ |-|_|'/g, "").toLowerCase();

      if (!tagMap[fixedTag]) tagMap[fixedTag] = {};
      if (!tagMap[fixedTag][tagName]) tagMap[fixedTag][tagName] = 0;

      tagMap[fixedTag][tagName] += tag.occurrences;

      return fixedTag;
    }

    function reverser(fixedTag: string): MirrorballTag {
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

  private filterTags(
    ctx: GowonContext,
    tags: MirrorballTag[]
  ): MirrorballTag[] {
    return this.wordBlacklistService.filter(
      ctx,
      tags,
      ["base", "tags"],
      this.customBlacklist
    );
  }

  private convertTags(
    tags: (string | RawTag | MirrorballTag)[]
  ): MirrorballTag[] {
    const convertedTags = [] as MirrorballTag[];

    for (const tag of tags) {
      if (isMirrorballTag(tag)) {
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
