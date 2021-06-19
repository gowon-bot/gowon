import { fromUnixTime } from "date-fns";

export function convertIndexerDate(date: number): Date {
  return fromUnixTime(date);
}
