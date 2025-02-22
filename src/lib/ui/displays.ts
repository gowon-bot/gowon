import { DocumentNode } from "apollo-link";
import { format } from "date-fns";
import { User } from "discord.js";
import {
  bold,
  cleanURL,
  italic,
  sanitizeForDiscord,
} from "../../helpers/discord";
import { LastfmLinks } from "../../helpers/lastfm/LastfmLinks";
import { constants } from "../constants";
import { Emoji } from "../emoji/Emoji";

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
  sanitize = false
): string {
  return `[${sanitize ? sanitizeForDiscord(text) : text}](${cleanURL(link)})`;
}

export function displayDate(date: Date): string {
  return discordTimestamp(date, "D");
}

export function displayDateNoTime(date: Date): string {
  return format(date, constants.dateDisplayFormat);
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
  return `<t:${Math.round(date.getTime() / 1000)}:${flag}>`;
}

type IndexedListItem<T> = { value: T; i: number };

function isIndexedListItem<T>(
  item: T | IndexedListItem<T>
): item is IndexedListItem<T> {
  return item && typeof item === "object" && "value" in item && "i" in item;
}

export function displayNumberedList<T>(
  list: IndexedListItem<T>[] | T[],
  startAt = 0,
  step = 1,
  padding = ""
): string {
  const getDisplayIdx = (val: T | IndexedListItem<T>, idx: number) => {
    if (isIndexedListItem(val)) {
      return val.i;
    }

    return idx * step + startAt + (step === 1 ? 1 : 0);
  };

  const columnWidth = Math.max(
    ...list.map((val, idx) => getDisplayIdx(val, idx).toString().length)
  );

  return list
    .map((val, idx) => {
      const displayIdx = getDisplayIdx(val, idx);
      const numberDisplay = displayIdx.toString();
      const spaces = columnWidth - numberDisplay.length;
      const displayValue = isIndexedListItem(val) ? val.value : val;

      return `${padding}\`${" ".repeat(
        spaces
      )}${numberDisplay}\`. ${displayValue}`;
    })
    .join("\n");
}

export function displayIconList<T = unknown>(
  list: T[],
  getIcon: (t: T) => string,
  getLine: (t: T) => string
): string {
  const widestIcon =
    list.map(getIcon).sort((a, b) => b.length - a.length)[0]?.length ?? 0;

  return list
    .map((val) => {
      const icon = getIcon(val);
      const line = getLine(val);

      const spaces = widestIcon - icon.length;

      return `\`${" ".repeat(spaces)}${icon}\`. ${line}`;
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

export interface ProgressBarDisplayOptions {
  width: number;
  progressEmoji: string;
  remainingEmoji: string;
}

export function displayProgressBar(
  progress: number,
  total: number,
  displayOptions: Partial<ProgressBarDisplayOptions> = {}
): string {
  const options = Object.assign(
    {
      width: 10,
      progressEmoji: Emoji.progress,
      remainingEmoji: Emoji.remainingProgress,
    },
    displayOptions
  );

  const relativeProgress = Math.floor((options.width * progress) / total);

  return `${options.progressEmoji.repeat(
    relativeProgress
  )}${options.remainingEmoji.repeat(options.width - relativeProgress)}`;
}

export function displayErrorredProgressBar(width?: number): string {
  return displayProgressBar(1, 1, {
    width: width,
    progressEmoji: Emoji.evilProgress,
  });
}

export function displayArtistLink(
  artist: string,
  stylize: boolean = false
): string {
  const link = displayLink(artist, LastfmLinks.artistPage(artist));

  return stylize ? bold(link, false) : link;
}

export function displayAlbumLink(
  artist: string,
  album: string,
  stylize: boolean = false
): string {
  const link = displayLink(album, LastfmLinks.albumPage(artist, album));

  return stylize ? italic(link, false) : link;
}

export function displayTrackLink(
  artist: string,
  track: string,
  stylize: boolean = false
): string {
  const link = displayLink(track, LastfmLinks.trackPage(artist, track));

  return stylize ? italic(link, false) : link;
}

export function displayUserTag(user: User | undefined): string {
  if (!user) return "";

  if (user.discriminator === "0") {
    return user.username;
  }

  return user.tag;
}

export function highlightKeywords(
  text: string,
  keywords: string,
  highligther = bold
): string {
  return text.replaceAll(new RegExp(`${keywords}`, "gi"), (match) =>
    highligther(match)
  );
}
