import { Duration, sub } from "date-fns";
import { DateRange } from "../DateRange";

export function dateRangeFromDuration(duration: Duration) {
  const fromDate = sub(new Date(), duration);

  return new DateRange({
    from: fromDate,
    to: new Date(),
    duration: duration,
  });
}
