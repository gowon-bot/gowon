import {
  LastFMPeriod,
  TimeframeParams,
} from "../../services/LastFM/LastFMService.types";
import { dateRangeFromDuration } from "./helpers";
import { humanizeDateRange } from "./helpers/humanize";
import { parseDateRange } from "./helpers/parse";
import { NamedRange } from "./NamedRange";

export class DateRange {
  static fromPeriod(
    period?: LastFMPeriod,
    options: { fallback?: Duration | "overall"; useOverall?: boolean } = {}
  ): DateRange | undefined {
    return parseDateRange(period, options);
  }

  static fromDuration(duration: Duration): DateRange {
    return dateRangeFromDuration(duration);
  }

  static overall(): DateRange {
    return new DateRange({
      to: new Date(),
      isOverall: true,
    });
  }

  constructor(
    private options: {
      from?: Date;
      to?: Date;
      duration?: Duration;
      isOverall?: boolean;
      namedRange?: NamedRange;
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

  get namedRange(): NamedRange | undefined {
    return this.options.namedRange;
  }

  humanized(includeTime?: boolean): string {
    return (
      this.namedRange?.humanized || humanizeDateRange(this, { includeTime })
    );
  }

  get asTimeframeParams(): TimeframeParams {
    const params = {} as TimeframeParams;

    if (this.from) params.from = ~~(this.from.getTime() / 1000);
    if (this.to) params.to = ~~(this.to.getTime() / 1000);

    return params;
  }
}
