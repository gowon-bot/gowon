import { Duration } from "date-fns";
import { parseTimeRange, TimeRange } from "../../timeAndDate/helpers";
import { NamedRangeParser } from "../../timeAndDate/NamedRangeParser";
import { BaseCustomParser } from "./custom";

export class TimeRangeParser extends BaseCustomParser<TimeRange> {
  private namedRangeParser = new NamedRangeParser();

  constructor(
    private options: { fallback?: Duration; useOverall?: boolean } = {}
  ) {
    super();
  }

  parse(string: string): TimeRange {
    const namedRange = this.namedRangeParser.parse(string);

    if (namedRange) return namedRange;

    return parseTimeRange(string, this.options);
  }
}
