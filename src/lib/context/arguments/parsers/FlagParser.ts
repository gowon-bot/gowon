import escapeStringRegexp from "escape-string-regexp";

export interface FlagOptions {
  description: string;
  longnames: readonly string[];
  shortnames: readonly string[];
}

export class FlagParser {
  public parse(flag: FlagOptions, string: string): boolean {
    if (this.stringHasFlag(string, flag)) {
      return true;
    } else {
      return false;
    }
  }

  public clean(flag: FlagOptions, string: string): string {
    if (this.stringHasFlag(string, flag)) {
      return this.removeFlagFromString(string, flag);
    }

    return string;
  }

  private stringHasFlag(string: string, flag: FlagOptions): boolean {
    const regex = this.generateFlagRegex(flag);

    if (!regex) return false;

    const matches = Array.from(string.matchAll(regex));

    return matches.length > 0;
  }

  private removeFlagFromString(string: string, flag: FlagOptions): string {
    const regex = this.generateFlagRegex(flag);

    if (!regex) return string;

    return string.replace(regex, "");
  }

  private generateFlagRegex(flag: FlagOptions): RegExp | undefined {
    let regexStrings = [] as string[];

    if (flag.shortnames.length) {
      regexStrings.push(`-(${this.escapeRegexes(flag.shortnames).join("|")})`);
    }
    if (flag.longnames.length) {
      regexStrings.push(`--(${this.escapeRegexes(flag.longnames).join("|")})`);
    }

    if (!regexStrings.length) return;

    return new RegExp(`(\\s|^)${regexStrings.join("|")}(\\s|$)`, "gi");
  }

  private escapeRegexes(strings: readonly string[]) {
    return strings.map(escapeStringRegexp);
  }
}
