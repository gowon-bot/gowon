import { fromUnixTime } from "date-fns";
import { toInt } from "./native/number";

export function convertLilacDate(date: number): Date {
  return fromUnixTime(toInt(date));
}
