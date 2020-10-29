import { Tag } from "../services/LastFM/LastFMService.types";

export class TagConsolidator {
  blacklistedTags = [
    "seen live",
    "albums I own",
    "check out",
    "all",
    "amazing",
    "soty",
    "aoty",
    "songs seen live",
    "fave",
    "love at first listen",
  ];

  tags: string[] = [];
  characterLimit = 30;

  hasAnyTags(): boolean {
    return !!this.tags.length;
  }

  addTags(tags: Tag[]): TagConsolidator {
    this.tags.push(
      ...tags
        .map((t) => t.name.toLowerCase())
        .filter((t) => !this.blacklistedTags.includes(t))
    );
    return this;
  }

  tagFixer(): {
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

  consolidate(max: number = Infinity, useCharacterLimit = true): string[] {
    let { fixer, reverser } = this.tagFixer();

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
}
