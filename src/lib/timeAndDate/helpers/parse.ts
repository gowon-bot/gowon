import { isValid, parse, sub } from "date-fns";
import { timeRangeFromDuration } from ".";
import { DurationParser } from "../../context/arguments/parsers/DurationParser";
import { overallRegex } from "../../context/arguments/parsers/TimePeriodParser";
import { TimeRange } from "../TimeRange";

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

export function parseTimeRange(
  string?: string,
  options: { fallback?: Duration | "overall"; useOverall?: boolean } = {}
): TimeRange | undefined {
  if (
    (options.useOverall && overallRegex.test(string || "")) ||
    options.fallback === "overall"
  ) {
    return new TimeRange({
      to: new Date(),
      isOverall: options.useOverall,
    });
  }

  if (options.fallback) {
    return new TimeRange({
      from: sub(new Date(), options.fallback),
      to: new Date(),
      duration: options.fallback,
    });
  }

  const durationParser = new DurationParser();

  const parsedDuration = durationParser.parse(string || "");

  if (Object.keys(parsedDuration || {}).length) {
    return timeRangeFromDuration(parsedDuration);
  }

  return undefined;
}
