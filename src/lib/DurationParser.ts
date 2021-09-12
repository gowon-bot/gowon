import { Duration } from "date-fns";
import { SimpleMap } from "../helpers/types";

export interface Shorthand {
  friendlyName: string;
  acronyms: string[];
  duration: Duration;
}

export class DurationParser {
  durations = {
    years: ["year", "years", "y"],
    months: ["month", "months", "mo", "m"],
    weeks: ["week", "weeks", "w"],
    days: ["day", "days", "d"],
    hours: ["hour", "hours", "h", "ho", "hr"],
    minutes: ["minute", "minutes", "mi"],
    seconds: ["second", "seconds", "s"],
  };

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
    let shorthand = this.parseShorthands(string);

    if (shorthand) return shorthand;

    let durations = Object.values(this.durations).flat().join("|");

    let regex = new RegExp(
      `(?<=^|\\s)(-?[0-9,.])*\\s*(${durations})(?=\\s|$)`,
      "gi"
    );

    let match = (string.trim().match(regex) || [])[0];
    let duration = {} as SimpleMap<number>;

    if (match) {
      let [amount, period] = this.getAmountAndPeriod(match);

      for (let [durationKey, matchers] of Object.entries(this.durations)) {
        if (matchers.includes(period)) {
          duration[durationKey] =
            amount < 1 ? Math.ceil(amount) : Math.round(amount);
        }
      }
    }

    return duration as Duration;
  }

  isDuration(string: string): boolean {
    let duration = this.parse(string);

    return Object.keys(duration).length > 0;
  }

  private getAmountAndPeriod(match: string): [number, string] {
    let amount: string, period: string;

    [amount, period] = match
      .replace(",", "")
      .split(/\s+/)
      .map((s) => s.trim().toLowerCase());

    if (!period) {
      let secondaryMatch = (Array.from(amount.matchAll(/(-?[0-9.]+)(\w+)/gi)) ||
        [])[0];

      if (!secondaryMatch) return [1, amount.replace(".", "")];

      return [
        parseFloat(secondaryMatch[1].trim().toLowerCase()),
        secondaryMatch[2].trim().toLowerCase(),
      ];
    }

    return [parseFloat(amount), period];
  }

  private parseShorthands(string: string): Duration | undefined {
    let regex = this.buildShorthandRegex();

    let match = (string.trim().match(regex) || [])[0];

    if (match) {
      let shorthand = this.findShorthand(match);

      if (shorthand) {
        return shorthand.duration;
      }
    }

    return undefined;
  }

  private buildShorthandRegex(): RegExp {
    let shorthands = this.shorthands
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
