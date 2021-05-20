import { RawTag } from "../../services/LastFM/LastFMService.types";
import blacklistedTags from "./blacklistedTags.json";

function isTagArray(tags: string[] | RawTag[]): tags is RawTag[] {
  return (tags as RawTag[])[0]?.name !== undefined;
}

export class TagConsolidator {
  blacklistedTags: string[];
  regexBlacklist: RegExp[];
  explicitTags: string[];

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

  tags: string[] = [];
  characterLimit = 30;

  hasAnyTags(): boolean {
    return !!this.tags.length;
  }

  addTags(tags: RawTag[] | string[]): TagConsolidator {
    let tagStrings = isTagArray(tags)
      ? tags.map((t) => t.name.toLowerCase())
      : tags.map((t) => t.toLowerCase());

    this.tags.push(...this.filterTags(tagStrings));
    return this;
  }

  consolidate(max: number = Infinity, useCharacterLimit = true): string[] {
    let { fixer, reverser } = TagConsolidator.tagFixer();

    let tagCounts = this.tags.reduce((acc, tag) => {
      let fixedTagName = fixer(tag);

      if (!acc[fixedTagName]) acc[fixedTagName] = 0;

      acc[fixedTagName]++;

      return acc;
    }, {} as { [tagName: string]: number });

    return Object.keys(tagCounts)
      .sort((a, b) => tagCounts[b] - tagCounts[a])
      .map((t) => reverser(t))
      .filter((t) => !useCharacterLimit || t.length <= this.characterLimit)
      .slice(0, max);
  }

  hasTag(...tags: string[]): boolean {
    for (let tag of tags) {
      if (this.consolidate().includes(tag)) return true;
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
    fixer: (tag: string) => string;
    reverser: (tag: string) => string;
  } {
    let tagMap: { [fixedTag: string]: { [tag: string]: number } } = {};

    function fixer(tag: string): string {
      let fixedTag = tag.replace(/ |-|_|'/g, "").toLowerCase();

      if (!tagMap[fixedTag]) tagMap[fixedTag] = {};
      if (!tagMap[fixedTag][tag]) tagMap[fixedTag][tag] = 0;

      !tagMap[fixedTag][tag]++;

      return fixedTag;
    }

    function reverser(fixedTag: string): string {
      return (
        Object.keys(tagMap[fixedTag]).sort(
          (a, b) => tagMap[fixedTag][b] - tagMap[fixedTag][a]
        )[0] || fixedTag
      );
    }

    return { reverser, fixer };
  }

  private filterTags(tags: string[]): string[] {
    return tags
      .filter(
        (tag) => !this.blacklistedTags.includes(this.normalizeTagName(tag))
      )
      .filter(this.regexTagFilter.bind(this))
      .filter(this.explicitTagFilter.bind(this));
  }

  private explicitTagFilter(tag: string): boolean {
    return !this.explicitTags.some((eTag) => tag.includes(eTag));
  }

  private regexTagFilter(tag: string): boolean {
    return !this.regexBlacklist.some((regex) => regex.test(tag));
  }

  private normalizeTagName(tag: string): string {
    return tag.replace(/\s+/g, "").toLowerCase();
  }
}
