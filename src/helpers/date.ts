import { LastFMPeriod } from "../services/LastFM/LastFMService.types";
import {
  Duration,
  formatDuration,
  intervalToDuration,
  parse,
  isValid,
  sub,
} from "date-fns";
import { DurationParser } from "../lib/DurationParser";
import { overallRegex } from "../lib/arguments/custom/TimePeriodParser";

export class TimeRange {
  static fromPeriod(period: LastFMPeriod): TimeRange {
    console.log(period);

    return new TimeRange();
  }

  constructor(
    private options: {
      from?: Date;
      to?: Date;
      duration?: Duration;
      isOverall?: boolean;
    } = {}
  ) {}

  get isOverall(): boolean {
    return this.options.isOverall || false;
  }

  get from(): Date | undefined {
    return this.options.from;
  }

  get to(): Date | undefined {
    return this.options.to;
  }

  get duration(): Duration | undefined {
    return this.options.duration;
  }

  get difference(): number {
    return 0;
  }

  get humanized(): string {
    return humanizeTimeRange(this);
  }
}

export function parseDate(
  string: string,
  ...parsers: Array<string | ((string: string) => Date | undefined)>
): Date | undefined {
  if (!string) return;

  const now = new Date();

  for (const parser of parsers) {
    if (typeof parser === "string") {
      const attempt = parse(string, parser, now);

      if (attempt !== now && isValid(attempt)) return attempt;
    } else {
      const attempt = parser(string);
      if (attempt) return attempt;
    }
  }

  return;
}

export function humanizePeriod(period: LastFMPeriod): string {
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

export const humanizeDuration = (
  seconds: number | Duration,
  options: { cleanSingleDurations?: boolean } = {}
): string => {
  const duration =
    typeof seconds === "number"
      ? intervalToDuration({ start: 0, end: seconds * 1000 })
      : seconds;

  const split = formatDuration(duration).split(/\s+/);

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

function overThePast(string?: string) {
  if (!string) return "";

  return (
    "over the past " + (string.startsWith("1 ") ? string.substring(2) : string)
  );
}

export function humanizeTimeRange(
  timeRange: TimeRange,
  options: {
    fallback?: string;
    useOverall?: boolean;
    overallMessage?: string;
  } = {}
): string {
  const useOverall = options.useOverall || false;
  const overallMessage = options.overallMessage || "overall";

  if (timeRange.duration) {
    const timeString = humanizeDuration(
      timeRange.duration || timeRange.difference
    );

    if (timeString.length) return overThePast(timeString);
  } else if (useOverall && timeRange.isOverall) {
    return overallMessage;
  }

  return overThePast(options.fallback) || (!useOverall ? overallMessage : "");
}

export function parseTimeRange(
  string: string,
  options: { fallback?: Duration; useOverall?: boolean } = {}
) {
  const durationParser = new DurationParser();

  const parsedDuration = durationParser.parse(string);

  if (Object.keys(parsedDuration || {}).length) {
    const fromDate = sub(new Date(), parsedDuration);

    return new TimeRange({
      from: fromDate,
      to: new Date(),
      duration: parsedDuration,
    });
  }

  if ((options.useOverall && overallRegex.test(string)) || !options.fallback) {
    return new TimeRange({
      to: new Date(),
      isOverall: options.useOverall,
    });
  }

  return new TimeRange({
    from: sub(new Date(), options.fallback),
    to: new Date(),
    duration: options.fallback,
  });
}
