import { BaseService } from "./BaseService";
import blacklist from "../wordBlacklist.json";

type WordBlacklistScope = "base" | "tags";

interface RawWordBlacklistGroup {
  strings?: string[];
  regexes?: string[];
  explicit?: number[][];
}

interface WordBlacklistGroup {
  strings: string[];
  regexes: RegExp[];
  explicit: string[];
}

export type WordBlacklist = {
  [K in WordBlacklistScope]: WordBlacklistGroup;
};

export type RawWordBlacklist = {
  [K in WordBlacklistScope]: RawWordBlacklistGroup;
};

export class WordBlacklistService extends BaseService {
  private blacklist: WordBlacklist;

  constructor() {
    super();
    this.blacklist = this.parseRawBlacklist(blacklist);
  }

  filter<T extends string | { name: string }>(
    items: T[],
    scopes: WordBlacklistScope[] = ["base"],
    customBlacklist: string[] = []
  ): T[] {
    return items.filter((item) =>
      this.isAllowed(item, scopes, customBlacklist)
    );
  }

  isAllowed(
    item: string | { name: string },
    scopes: WordBlacklistScope[] = ["base"],
    customBlacklist: string[] = []
  ) {
    const blacklistGroup = this.getBlacklistsForScopes(scopes, customBlacklist);

    return (
      !blacklistGroup.strings.includes(this.normalizeItem(item)) &&
      !blacklistGroup.explicit.some((eTag) =>
        this.normalizeItem(item).includes(eTag)
      ) &&
      !blacklistGroup.regexes.some((regex) =>
        regex.test(this.getItemName(item))
      )
    );
  }

  private parseRawBlacklist(rawBlacklist: RawWordBlacklist): WordBlacklist {
    const blacklist = {} as any as WordBlacklist;

    for (const [scope, bl] of Object.entries(rawBlacklist)) {
      blacklist[scope as WordBlacklistScope] = {
        strings: (bl.strings || []).map((s) => this.normalizeItem(s)),
        regexes: (bl.regexes || []).map((r) => new RegExp(r)),
        explicit: this.parseExplicitBlacklist(bl.explicit || []),
      };
    }

    return blacklist;
  }

  private getBlacklistsForScopes(
    scopes: WordBlacklistScope[],
    customBlacklist: string[] = []
  ): WordBlacklistGroup {
    const group: WordBlacklistGroup = {
      strings: [],
      regexes: [],
      explicit: [],
    };

    for (const scope of scopes) {
      group.strings.push(...this.blacklist[scope].strings);
      group.explicit.push(...this.blacklist[scope].explicit);
      group.regexes.push(...this.blacklist[scope].regexes);
    }

    if (customBlacklist.length) {
      group.strings.push(...customBlacklist.map((t) => this.normalizeItem(t)));
    }

    return group;
  }

  private parseExplicitBlacklist(blacklist: number[][]): string[] {
    const letters = "abcdefghijklmnopqrstuvwxyz";

    return blacklist.map((item) =>
      this.normalizeItem(
        item.map((letter) => letters.charAt(letter - 1)).join("")
      )
    );
  }

  private normalizeItem(item: string | { name: string }): string {
    return this.getItemName(item).replace(/\s+/g, "").toLowerCase();
  }

  private getItemName(item: string | { name: string }) {
    return typeof item === "string" ? item : item.name;
  }
}
