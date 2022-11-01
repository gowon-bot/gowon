import { formatDuration, intervalToDuration } from "date-fns";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";
import { TimeRange } from "../TimeRange";

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
    const timeString = humanizeDuration(timeRange.duration);

    if (timeString.length) return overThePast(timeString);
  } else if (useOverall && timeRange.isOverall) {
    return overallMessage;
  }

  return overThePast(options.fallback) || (!useOverall ? overallMessage : "");
}

function overThePast(string?: string) {
  if (!string) return "";

  return (
    "over the past " + (string.startsWith("1 ") ? string.substring(2) : string)
  );
}
