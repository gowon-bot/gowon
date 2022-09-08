import { fromUnixTime } from "date-fns";
import { toInt } from "./lastFM";

export function convertLilacDate(date: number): Date {
  return fromUnixTime(toInt(date));
}
