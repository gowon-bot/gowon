import { displayLink } from "../../lib/views/displays";

export interface ParsedTrack {
  artist: string;
  album: string;
  name: string;
  nowPlaying: boolean;
}

export class LinkConsolidator {
  constructor(private links: { link?: string; text: string }[]) {}

  hasLinks(): boolean {
    return !!this.links.filter((l) => !!l).length;
  }

  consolidate(): string {
    return this.links
      .filter((l) => !!l.link)
      .map((l) => displayLink(l.text, l.link!))
      .join(" ‧ ");
  }

  static spotify(url?: string) {
    return {
      link: url,
      text: "Spotify",
    };
  }

  static lastfm(url?: string) {
    return {
      link: url,
      text: "Last.fm",
    };
  }
}

export function toInt(number: any): number {
  if (typeof number === "number") {
    return number;
  } else if (typeof number === "string") {
    return parseInt(number.replaceAll(/(\s|,)+/g, ""), 10);
  }

  return parseInt(number, 10);
}
