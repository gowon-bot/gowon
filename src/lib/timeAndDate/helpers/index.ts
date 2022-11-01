import { Duration, sub } from "date-fns";
import { TimeRange } from "../TimeRange";

export function timeRangeFromDuration(duration: Duration) {
  const fromDate = sub(new Date(), duration);

  return new TimeRange({
    from: fromDate,
    to: new Date(),
    duration: duration,
  });
}
