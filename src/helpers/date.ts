import { LastFMPeriod } from "../services/LastFM/LastFMService.types";
import {
  Duration,
  formatDuration,
  intervalToDuration,
  sub,
  parse as fnsParse,
  isValid,
} from "date-fns";
import { DurationParser } from "../lib/DurationParser";

const overallRegex = /(\s+|\b)(a(lltime)?|o(verall)?)(\s|\b)/gi;

export interface TimeRange {
  from?: Date;
  to?: Date;
  difference?: number;
  duration?: Duration;
}

export function generatePeriod(
  string: string,
  fallback: LastFMPeriod = "overall"
): LastFMPeriod {
  let periodRegexes: { [period: string]: RegExp } = {
    "7day": /(\s+|\b)(1|one)? *(w(eek(s)?)?)|(7|seven) *d(ay(s)?)?(\s|\b)/gi,
    "3month": /(\s+|\b)((3|three) *m(o(nth(s)?)?)?|q(uarter)?)(\s|\b)/gi,
    "6month": /(\s+|\b)((6|six) *m(o(nth(s)?)?)?|h(alf(\s*year)?)?)(\s|\b)/gi,
    "12month": /(\s+|\b)((12|twelve) *m(o(nth(s)?)?)?|y(ear)?)(\s|\b)/gi,
    "1month": /(\s+|\b)(1|one)? *m(o(nth(s)?)?)?(\s|\b)/gi,
    overall: overallRegex,
  };

  for (let period of Object.keys(periodRegexes)) {
    let regex = periodRegexes[period];

    let matches = string.match(regex) || [];

    if (matches.length > 0) return period as LastFMPeriod;
  }

  return fallback;
}

export function generateHumanPeriod(
  string: string,
  fallback: LastFMPeriod = "overall"
): string {
  let period = generatePeriod(string, fallback);

  switch (period) {
    case "7day":
      return "over the past week";
    case "1month":
      return "over the past month";
    case "3month":
      return "over the past 3 months";
    case "6month":
      return "over the past 6 months";
    case "12month":
      return "over the past year";
    default:
      return "overall";
  }
}

export function parseDate(
  string: string,
  ...parsers: Array<string | ((string: string) => Date | undefined)>
): Date | undefined {
  if (!string) return;

  for (let parser of parsers) {
    if (typeof parser === "string") {
      let now = new Date();
      let attempt = fnsParse(string, parser, now);

      if (attempt !== now && isValid(attempt)) return attempt;
    } else {
      let attempt = parser(string);
      if (attempt) return attempt;
    }
  }

  return;
}

export const humanizeDuration = (
  seconds: number | Duration,
  options: { cleanSingleDurations?: boolean } = {}
): string => {
  const duration =
    typeof seconds === "number"
      ? intervalToDuration({ start: 0, end: seconds * 1000 })
      : seconds;

  let split = formatDuration(duration).split(/\s+/);

  if (options.cleanSingleDurations && split.length === 2 && split[0] === "1")
    return split[1];

  return split.reduce((acc, part, idx, arr) => {
    if (arr.length > 2 && arr.length - idx == 2) {
      acc += " and";
    } else if (idx % 2 === 0 && idx !== 0) {
      acc += ",";
    }

    acc += " " + part;

    return acc.trim();
  }, "");
};

export function timeRangeParser(
  options: { default?: Duration; useOverall?: boolean } = {}
): (string: string) => TimeRange {
  return (string) => {
    let durationParser = new DurationParser();

    let parsedDuration = durationParser.parse(string);

    if (parsedDuration && Object.keys(parsedDuration).length) {
      let fromDate = sub(new Date(), parsedDuration);

      return {
        from: fromDate,
        to: new Date(),
        duration: parsedDuration,
      };
    } else {
      if (options.useOverall && overallRegex.test(string))
        return { to: new Date() };

      if (!options.default) return { to: new Date() };

      return {
        from: sub(new Date(), options.default),
        to: new Date(),
        duration: options.default,
      };
    }
  };
}

export function humanizedTimeRangeParser(
  options: {
    raw?: boolean;
    default?: string;
    noOverall?: boolean;
    overallMessage?: string;
    cleanSingleDurations?: boolean;
  } = { overallMessage: "overall" }
): (string: string) => string {
  return (string: string) => {
    let timeRange = timeRangeParser()(string);

    if (timeRange.duration) {
      let timeString = humanizeDuration(
        timeRange.duration || timeRange.difference,
        {}
      );

      if (timeString.length)
        return (options.raw ? "" : "over the past ") + timeString;
    } else {
      if (!options.noOverall && overallRegex.test(string))
        return options.overallMessage!;
    }

    return options.default
      ? (options.raw ? "" : "over the past ") + options.default
      : options.noOverall
      ? ""
      : options.overallMessage!;
  };
}
