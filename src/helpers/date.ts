import parse from "parse-duration";
import { LogicError } from "../errors";
import { LastFMPeriod } from "../services/LastFM/LastFMService.types";
import {
  differenceInSeconds,
  Duration,
  formatDuration,
  intervalToDuration,
  sub,
  subSeconds,
  parse as fnsParse,
} from "date-fns";

const fallbackRegex = /(\s+|\b)1?(s(econd)?|mi(nute)?|h(our)?|d(ay)?|w(eek)?|m(o(nth)?)?|q(uarter)?|ha(lf)?|y(ear)?)(\s|\b)/gi;
const overallRegex = /(\s+|\b)(a(lltime)?|o(verall)?)(\s|\b)/gi;

function timeFrameConverter(timeframe: string): string {
  switch (timeframe.trim()) {
    case "s":
      return "second";
    case "mi":
      return "minute";
    case "h":
      return "hour";
    case "d":
      return "day";
    case "w":
      return "week";
    case "m":
    case "mo":
      return "month";
    case "q":
      return "quarter";
    case "ha":
      return "half";
    case "y":
      return "year";
  }

  return timeframe.trim();
}

function timeFrameToDuration(timeFrame: string): Duration {
  let timeFrameConverted = timeFrameConverter(timeFrame) + "s";

  if (timeFrameConverted === "quarters") {
    return { months: 3 };
  } else if (timeFrameConverted === "halfs") {
    return { months: 6 };
  } else {
    let duration: Duration = {};
    duration[timeFrameConverted as keyof Duration] = 1;
    return duration;
  }
}

export interface TimeRange {
  from?: Date;
  to?: Date;
  difference?: number;
  duration?: Duration;
}

export function generateTimeRange(
  string: string,
  options: {
    fallback?: string;
    useOverall?: boolean;
    noFallback?: boolean;
  } = {}
): TimeRange {
  let difference = parse(string, "second");


  if ((difference || 0) < -1)
    throw new LogicError("that's in the future, dumbass");

  if (!difference) {
    if (options.noFallback) return {};

    let matches = string.match(fallbackRegex) || [];
    let overallMatch = string.match(overallRegex) || [];

    if (overallMatch.length && options.useOverall) return { to: new Date() };

    if (matches.length < 1)
      return options.fallback
        ? generateTimeRange(options.fallback)
        : { to: new Date() };

    let duration = timeFrameToDuration(matches[0]);

    let fromDate = sub(new Date(), duration);

    return {
      from: fromDate,
      to: new Date(),
      difference: differenceInSeconds(new Date(), fromDate),
      duration,
    };
  }

  return {
    from: subSeconds(new Date(), difference),
    to: new Date(),
    difference,
  };
}

export function generateHumanTimeRange(
  string: string,
  options: {
    noOverall?: boolean;
    raw?: boolean;
    overallMessage?: string;
    fallback?: string;
  } = {
    noOverall: false,
    raw: false,
    overallMessage: "overall",
  }
): string {
  let timeRange = generateTimeRange(string);

  if (timeRange.difference && timeRange.duration) {
    let timeString = humanizeDurationInSeconds(
      timeRange.duration || timeRange.difference
    );

    if (timeString.length)
      return (options.raw ? "" : "over the past ") + timeString;
  } else {
    if (!options.noOverall && overallRegex.test(string))
      return options.overallMessage!;
  }
  return options.fallback
    ? (options.raw ? "" : "over the past ") + options.fallback
    : options.noOverall
    ? ""
    : options.overallMessage!;
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
      if (attempt !== now) return attempt;
    } else {
      let attempt = parser(string);
      if (attempt) return attempt;
    }
  }

  return;
}

export const humanizeDurationInSeconds = (
  seconds: number | Duration
): string => {
  const duration =
    typeof seconds === "number"
      ? intervalToDuration({ start: 0, end: seconds * 1000 })
      : seconds;

  return formatDuration(duration)
    .split(/\s+/)
    .reduce((acc, part, idx, arr) => {
      if (arr.length > 2 && arr.length - idx == 2) {
        acc += " and";
      } else if (idx % 2 === 0 && idx !== 0) {
        acc += ",";
      }

      acc += " " + part;

      return acc.trim();
    }, "");
};
