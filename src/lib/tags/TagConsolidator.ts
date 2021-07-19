import { sum } from "mathjs";
import { RawTag } from "../../services/LastFM/LastFMService.types";
import { MirrorballTag } from "../../services/mirrorball/MirrorballTypes";
import blacklistedTags from "./blacklistedTags.json";

function isMirrorballTag(tag: any | MirrorballTag): tag is MirrorballTag {
  return !!tag.name && !!tag.occurrences;
}

export class TagConsolidator {
  static readonly tagJoin = " ‧ ";

  blacklistedTags: string[];
  regexBlacklist: RegExp[];
  explicitTags: string[];

  tags: MirrorballTag[] = [];
  characterLimit = 30;

  constructor() {
    this.blacklistedTags = blacklistedTags.strings.map((tag) =>
      this.normalizeTagName(tag)
    );
    this.explicitTags = this.parseExplicitTags(blacklistedTags.explicit);
    this.regexBlacklist = blacklistedTags.regex.map(
      (regex) => new RegExp(`^${regex}$`, "i")
    );
  }

  blacklistTags(...nonTags: string[]): TagConsolidator {
    this.blacklistedTags.push(...nonTags.map(this.normalizeTagName));
    return this;
  }

  hasAnyTags(): boolean {
    return !!this.tags.length;
  }

  addTags(tags: RawTag[] | string[] | MirrorballTag[]): TagConsolidator {
    const convertedTags = this.convertTags(tags);

    this.tags.push(...this.filterTags(convertedTags));
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

  parseExplicitTags(tags: number[][]): string[] {
    const letters = "abcdefghijklmnopqrstuvwxyz";

    return tags.map((tag) =>
      tag.map((letter) => letters.charAt(letter - 1)).join("")
    );
  }

  static tagFixer(): {
    fixer: (tag: MirrorballTag) => string;
    reverser: (tag: string) => MirrorballTag;
  } {
    let tagMap: { [fixedTag: string]: { [tag: string]: number } } = {};

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

  private filterTags(tags: MirrorballTag[]): MirrorballTag[] {
    return tags
      .filter(
        (tag) => !this.blacklistedTags.includes(this.normalizeTagName(tag.name))
      )
      .filter(this.regexTagFilter.bind(this))
      .filter(this.explicitTagFilter.bind(this));
  }

  private explicitTagFilter(tag: MirrorballTag): boolean {
    return !this.explicitTags.some((eTag) => tag.name.includes(eTag));
  }

  private regexTagFilter(tag: MirrorballTag): boolean {
    return !this.regexBlacklist.some((regex) => regex.test(tag.name));
  }

  private normalizeTagName(tag: string): string {
    return tag.replace(/\s+/g, "").toLowerCase();
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
