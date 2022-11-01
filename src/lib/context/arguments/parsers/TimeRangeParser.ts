import { Duration } from "date-fns";
import { NamedRangeParser } from "./NamedRangeParser";
import { BaseCustomParser } from "./custom";
import { TimeRange } from "../../../timeAndDate/TimeRange";
import { parseTimeRange } from "../../../timeAndDate/helpers/parse";

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
