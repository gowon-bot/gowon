import { DocumentNode } from "apollo-link";
import { format } from "date-fns";
import { cleanURL, sanitizeForDiscord } from "../../helpers/discord";
import { Emoji } from "../Emoji";

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

export function displayQuery(query: DocumentNode): string | undefined {
  return query.loc?.source?.body;
}

export function displayPlainRating(rating: number): string {
  const numberOfStars = rating / 2;
  const hasHalfStar = rating % 2 == 1;

  return "★".repeat(numberOfStars) + (hasHalfStar ? "½" : "");
}

export function displayRating(rating: number): string {
  const numberOfStars = rating / 2;
  const hasHalfStar = rating % 2 == 1;

  return (
    Emoji.fullStar.repeat(numberOfStars) +
    (hasHalfStar ? Emoji.halfStar : "") +
    Emoji.emptyStar.repeat(Math.floor((10 - rating) / 2))
  );
}
