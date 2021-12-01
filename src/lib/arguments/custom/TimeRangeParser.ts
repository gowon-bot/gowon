import { Duration } from "date-fns";
import { parseTimeRange, TimeRange } from "../../../helpers/date";
import { BaseCustomParser } from "./custom";

export class TimeRangeParser extends BaseCustomParser<TimeRange> {
  constructor(
    private options: { fallback?: Duration; useOverall?: boolean } = {}
  ) {
    super();
  }

  parse(string: string): TimeRange {
    return parseTimeRange(string, this.options);
  }
}
