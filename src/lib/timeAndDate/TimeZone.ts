import { getTimezoneOffset, utcToZonedTime } from "date-fns-tz";
import { TimeZonedDate } from "../../services/TimeAndDateService";

export class TimeZone {
  private timezone: string;

  constructor(timezone: string) {
    this.timezone = timezone;
  }

  static fromString(string: string | undefined): TimeZone | undefined {
    if (!string) return undefined;

    return new TimeZone(string);
  }

  static isValidString(string?: string): boolean {
    return !isNaN(getTimezoneOffset(string || ""));
  }

  apply(date: Date): TimeZonedDate {
    return utcToZonedTime(date, this.asString());
  }

  public asString(): string {
    return this.timezone;
  }
}
