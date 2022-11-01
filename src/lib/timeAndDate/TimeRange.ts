import {
  LastFMPeriod,
  TimeframeParams,
} from "../../services/LastFM/LastFMService.types";
import { timeRangeFromDuration } from "./helpers";
import { humanizeTimeRange } from "./helpers/humanize";
import { parseTimeRange } from "./helpers/parse";
import { NamedRange } from "./NamedRange";

export class TimeRange {
  static fromPeriod(
    period?: LastFMPeriod,
    options: { fallback?: Duration | "overall"; useOverall?: boolean } = {}
  ): TimeRange | undefined {
    return parseTimeRange(period, options);
  }

  static fromDuration(duration: Duration): TimeRange {
    return timeRangeFromDuration(duration);
  }

  static overall(): TimeRange {
    return new TimeRange({
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

  get humanized(): string {
    return this.namedRange?.humanized || humanizeTimeRange(this);
  }

  get asTimeframeParams(): TimeframeParams {
    const params = {} as TimeframeParams;

    if (this.from) params.from = ~~(this.from.getTime() / 1000);
    if (this.to) params.to = ~~(this.to.getTime() / 1000);

    return params;
  }
}
