import { Duration } from "date-fns";
import { parseTimeRange, TimeRange } from "../../timeAndDate/helpers";
import { NamedRangeParser } from "../../timeAndDate/NamedRangeParser";
import { BaseCustomParser } from "./custom";

export class TimeRangeParser extends BaseCustomParser<TimeRange | undefined> {
  private namedRangeParser = new NamedRangeParser();

  constructor(
    private options: {
      fallback?: Duration | "overall";
      useOverall?: boolean;
    } = {}
  ) {
    super();
  }

  parse(string: string): TimeRange | undefined {
    const namedRange = this.namedRangeParser.parse(string);

    if (namedRange) return namedRange;

    return parseTimeRange(string, this.options);
  }
}
