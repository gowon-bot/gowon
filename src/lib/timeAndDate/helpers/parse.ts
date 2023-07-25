import { isValid, parse, sub } from "date-fns";
import { dateRangeFromDuration } from ".";
import { DurationParser } from "../../context/arguments/parsers/DurationParser";
import { overallRegex } from "../../context/arguments/parsers/TimePeriodParser";
import { DateRange } from "../DateRange";

export function parseDate(
  string: string,
  ...parsers: Array<string | ((string: string) => Date | undefined)>
): Date | undefined {
  if (!string) return;

  const now = new Date();

  for (const parser of parsers) {
    if (typeof parser === "string") {
      const attempt = parse(string, parser, now);

      if (attempt !== now && isValid(attempt)) {
        return attempt;
      }
    } else {
      const attempt = parser(string);

      if (attempt && isValid(attempt)) {
        return attempt;
      }
    }
  }

  return;
}

export function parseDateRange(
  string?: string,
  options: { fallback?: Duration | "overall"; useOverall?: boolean } = {}
): DateRange | undefined {
  const durationParser = new DurationParser();

  const parsedDuration = durationParser.parse(string || "");

  if (Object.keys(parsedDuration || {}).length) {
    return dateRangeFromDuration(parsedDuration);
  }

  if (
    (options.useOverall && overallRegex.test(string || "")) ||
    options.fallback === "overall"
  ) {
    return new DateRange({
      to: new Date(),
      isOverall: options.useOverall,
    });
  }

  if (options.fallback) {
    return new DateRange({
      from: sub(new Date(), options.fallback),
      to: new Date(),
      duration: options.fallback,
    });
  }

  return undefined;
}
