import { fromUnixTime } from "date-fns";

export function convertMirrorballDate(date: number): Date {
  return fromUnixTime(date);
}
