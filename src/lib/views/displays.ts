import { format } from "date-fns";
import { cleanURL, sanitizeForDiscord } from "../../helpers/discord";

export function displayNumber(
  number: number | string | undefined,
  unit?: string,
  noSpace = false
): string {
  let parsedNumber = number;

  if (typeof number === "string") {
    parsedNumber = Number(number) || 0;
  }

  parsedNumber ||= 0;

  return (
    parsedNumber.toLocaleString() +
    (unit
      ? (noSpace ? "" : " ") + (parsedNumber === 1 ? unit : unit + "s")
      : "")
  );
}

export function displayLink(text: string, link: string): string {
  return `[${sanitizeForDiscord(text)}](${cleanURL(link)})`;
}

export function displayDate(date: Date): string {
  return format(date, "MMMM do, yyyy");
}

export function displayDateTime(date: Date | undefined): string {
  if (!date) return "";
  return format(date, "h:mma 'on' MMMM do, yyyy");
}

export function displayNumberedList(list: any[], startAt = 0): string {
  return list
    .map((val, idx) => {
      const spaces =
        `${startAt + list.length}`.length - `${idx + startAt + 1}`.length;

      return `\`${" ".repeat(spaces)}${displayNumber(
        idx + startAt + 1
      )}\`. ${val}`;
    })
    .join("\n");
}
