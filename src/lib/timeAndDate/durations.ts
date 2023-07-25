import { flatDeep } from "../../helpers/native/array";

export const durations = {
  years: ["year", "years", "y"],
  months: ["month", "months", "mo", "m"],
  weeks: ["week", "weeks", "w"],
  days: ["day", "days", "d"],
  hours: ["hour", "hours", "h", "ho", "hr"],
  minutes: ["minute", "minutes", "mi"],
  seconds: ["second", "seconds", "s"],
};

const durationList = flatDeep(Object.values(durations));

export function isDuration(string: string): boolean {
  return durationList.includes(string.toLowerCase());
}
