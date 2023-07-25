import { getTimezoneOffset, utcToZonedTime } from "date-fns-tz";
import { TimeZonedDate } from "../../services/TimeAndDateService";

export class TimeZone {
  constructor(private timezone: string) {}

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
