import { DocumentNode } from "apollo-link";
import {
  bold,
  cleanURL,
  italic,
  sanitizeForDiscord,
} from "../../helpers/discord";
import { LinkGenerator } from "../../helpers/lastFM";
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

export function displayLink(
  text: string,
  link: string,
  sanitize = true
): string {
  return `[${sanitize ? sanitizeForDiscord(text) : text}](${cleanURL(link)})`;
}

export function displayDate(date: Date): string {
  return discordTimestamp(date, "D");
}

export function displayDateTime(date: Date | undefined): string {
  if (!date) return "";
  return discordTimestamp(date, "f");
}

export function displayTime(date: Date | undefined): string {
  if (!date) return "";
  return discordTimestamp(date, "t");
}

export function discordTimestamp(
  date: Date,
  flag: "t" | "T" | "d" | "D" | "f" | "F" | "R" = "f"
) {
  return `<t:${Math.round(+date / 1000)}:${flag}>`;
}

export function displayNumberedList(
  list: any[],
  startAt = 0,
  step = 1,
  padding = ""
): string {
  return list
    .map((val, idx) => {
      const displayIdx = idx * step + startAt + (step === 1 ? 1 : 0);

      const spaces = `${startAt + list.length}`.length - `${displayIdx}`.length;

      return `${padding}\`${" ".repeat(spaces)}${displayNumber(
        displayIdx
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

export function displayProgressBar(
  progress: number,
  total: number,
  displayOptions: Partial<{
    width: number;
    progressEmoji: string;
    remainingEmoji: string;
  }>
): string {
  const options = Object.assign(
    {
      width: 10,
      progressEmoji: "🟩",
      remainingEmoji: "⬜",
    },
    displayOptions
  );

  const relativeProgress = Math.floor((options.width * progress) / total);

  return `${options.progressEmoji.repeat(
    relativeProgress
  )}${options.remainingEmoji.repeat(options.width - relativeProgress)}`;
}

export function displayArtistLink(
  artist: string,
  stylize: boolean = false
): string {
  const link = displayLink(artist, LinkGenerator.artistPage(artist));

  return stylize ? bold(link, false) : link;
}

export function displayAlbumLink(
  artist: string,
  album: string,
  stylize: boolean = false
): string {
  const link = displayLink(album, LinkGenerator.albumPage(artist, album));

  return stylize ? italic(link, false) : link;
}

export function displayTrackLink(
  artist: string,
  track: string,
  stylize: boolean = false
): string {
  const link = displayLink(track, LinkGenerator.trackPage(artist, track));

  return stylize ? italic(link, false) : link;
}
