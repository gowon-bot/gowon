import { fromUnixTime } from "date-fns";
import { toInt } from "./lastfm/";

export function convertLilacDate(date: number): Date {
  return fromUnixTime(toInt(date));
}
