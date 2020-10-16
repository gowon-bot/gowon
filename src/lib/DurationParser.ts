import { Duration } from "date-fns";

export class DurationParser {
  durations = {
    years: ["year", "years", "y"],
    months: ["month", "months", "mo", "m"],
    weeks: ["week", "weeks", "w"],
    days: ["day", "days", "d"],
    hours: ["hour", "hours", "h"],
    minutes: ["minute", "minutes", "mi"],
    seconds: ["second", "seconds", "s"],
  };

  parse(string: string): Duration | undefined {
    let durations = Object.values(this.durations).flat().join("|");

    let regex = new RegExp(
      `(?<=^|\\s)(-?[0-9,.])*\\s*(${durations})(?=\\s|$)`,
      "gi"
    );

    let match = (string.trim().match(regex) || [])[0];
    let duration = {} as { [key: string]: number };

    if (match) {
      let [amount, period] = this.getAmountAndPeriod(match);

      for (let [durationKey, matchers] of Object.entries(this.durations)) {
        if (matchers.includes(period)) {
          duration[durationKey] = amount;
        }
      }
    }

    return duration as Duration;
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

      return [parseFloat(secondaryMatch[1].trim()), secondaryMatch[2].trim()];
    }

    return [parseFloat(amount), period];
  }
}
