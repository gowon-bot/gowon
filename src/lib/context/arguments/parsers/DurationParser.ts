import { Duration } from "date-fns";
import { SimpleMap } from "../../../../helpers/types";
import { durations } from "../../../timeAndDate/durations";

export interface Shorthand {
  friendlyName: string;
  acronyms: string[];
  duration: Duration;
}

export class DurationParser {
  durations = durations;

  shorthands: Shorthand[] = [
    {
      friendlyName: "quarter",
      acronyms: ["q"],
      duration: {
        months: 3,
      } as Duration,
    },
    {
      friendlyName: "half year",
      acronyms: ["h", "half"],
      duration: {
        months: 6,
      } as Duration,
    },
  ];

  parse(string: string): Duration {
    const shorthand = this.parseShorthands(string);

    if (shorthand) return shorthand;

    const durations = Object.values(this.durations).flat().join("|");

    const regex = new RegExp(
      `(?<=^|\\s)(-?[0-9,.])*\\s*(${durations})(?=\\s|$)`,
      "gi"
    );

    const match = (string.trim().match(regex) || [])[0];
    const duration = {} as SimpleMap<number>;

    if (match) {
      const [amount, period] = this.getAmountAndPeriod(match);

      for (const [durationKey, matchers] of Object.entries(this.durations)) {
        if (matchers.includes(period)) {
          duration[durationKey] =
            amount < 1 ? Math.ceil(amount) : Math.round(amount);
        }
      }
    }

    return duration as Duration;
  }

  isDuration(string: string | undefined): boolean {
    if (!string) return false;

    const duration = this.parse(string);

    return Object.keys(duration).length > 0;
  }

  private getAmountAndPeriod(match: string): [number, string] {
    let amount: string, period: string;

    [amount, period] = match
      .replace(",", "")
      .split(/\s+/)
      .map((s) => s.trim().toLowerCase());

    if (!period) {
      const secondaryMatch = (Array.from(
        amount.matchAll(/(-?[0-9.]+)(\w+)/gi)
      ) || [])[0];

      if (!secondaryMatch) return [1, amount.replace(".", "")];

      return [
        parseFloat(secondaryMatch[1].trim().toLowerCase()),
        secondaryMatch[2].trim().toLowerCase(),
      ];
    }

    return [parseFloat(amount), period];
  }

  private parseShorthands(string: string): Duration | undefined {
    const regex = this.buildShorthandRegex();

    const match = (string.trim().match(regex) || [])[0];

    if (match) {
      const shorthand = this.findShorthand(match);

      if (shorthand) {
        return shorthand.duration;
      }
    }

    return undefined;
  }

  private buildShorthandRegex(): RegExp {
    const shorthands = this.shorthands
      .map((s) => [...s.acronyms, s.friendlyName])
      .flat()
      .join("|");

    return new RegExp(`(?<=^|\\s)(?<![0-9]\\s)(${shorthands})(?=\\s|$)`);
  }

  private findShorthand(shorthandString: string): Shorthand | undefined {
    return this.shorthands.find((s) =>
      [...s.acronyms, s.friendlyName].includes(shorthandString.toLowerCase())
    );
  }
}
