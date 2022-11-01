import { format } from "date-fns";
import { displayLink } from "../lib/views/displays";
import { RecentTrack } from "../services/LastFM/converters/RecentTracks";
import { cleanURL } from "./discord";

export interface TrackLinks {
  artist: string;
  album: string;
  track: string;
}

export abstract class LinkGenerator {
  static baseURL = "https://www.last.fm/";

  static encode(string: string): string {
    return cleanURL(
      encodeURIComponent(string).replace(/%2B/g, "%252B").replace(/%20/g, "+")
    );
  }

  // https://www.last.fm/music/Red+Velvet
  static artistPage(artist: string) {
    return this.baseURL + "music/" + this.encode(artist);
  }

  // https://www.last.fm/music/Red+Velvet/Rookie+-+The+4th+Mini+Album
  static albumPage(artist: string, album: string) {
    return (
      this.baseURL + "music/" + this.encode(artist) + "/" + this.encode(album)
    );
  }

  // https://www.last.fm/music/Red+Velvet/_/Psycho
  static trackPage(artist: string, track: string) {
    return (
      this.baseURL + "music/" + this.encode(artist) + "/_/" + this.encode(track)
    );
  }

  // https://www.last.fm/user/flushed_emoji
  static userPage(username: string): string {
    return this.baseURL + "user/" + this.encode(username);
  }

  // https://www.last.fm/tag/kpop
  static tagPage(tag: string): string {
    return this.baseURL + "tag/" + this.encode(tag);
  }

  // https://www.last.fm/music/TWICE/+listeners/you-know
  static listenersYouKnow(artist: string): string {
    return (
      this.baseURL + "music/" + this.encode(artist) + "/+listeners/you-know"
    );
  }

  // https://www.last.fm/user/flushed_emoji/library/music/Red+Velvet
  static libraryArtistPage(username: string, artist: string): string {
    return (
      this.baseURL +
      "user/" +
      this.encode(username) +
      "/library/music/" +
      this.encode(artist)
    );
  }

  // https://www.last.fm/user/flushed_emoji/library/music/WJSN/+albums
  static libraryArtistTopAlbums(username: string, artist: string): string {
    return (
      this.baseURL +
      "user/" +
      this.encode(username) +
      "/library/music/" +
      this.encode(artist) +
      "/+albums"
    );
  }

  // https://www.last.fm/user/flushed_emoji/library/music/WJSN/+tracks
  static libraryArtistTopTracks(username: string, artist: string): string {
    return (
      this.baseURL +
      "user/" +
      this.encode(username) +
      "/library/music/" +
      this.encode(artist) +
      "/+tracks"
    );
  }

  // https://www.last.fm/user/flushed_emoji/library/music/Red+Velvet/%E2%80%98The+ReVe+Festival%E2%80%99+Day+1
  static libraryAlbumPage(
    username: string,
    artist: string,
    track: string
  ): string {
    return (
      this.baseURL +
      "user/" +
      this.encode(username) +
      "/library/music/" +
      this.encode(artist) +
      "/" +
      this.encode(track)
    );
  }

  // https://www.last.fm/user/flushed_emoji/library/music/Red+Velvet/_/Sunny+Side+Up!
  static libraryTrackPage(
    username: string,
    artist: string,
    album: string
  ): string {
    return (
      this.baseURL +
      "user/" +
      this.encode(username) +
      "/library/music/" +
      this.encode(artist) +
      "/_/" +
      this.encode(album)
    );
  }

  // https://www.last.fm/music/The+Electriceels/Fluke/+images/upload
  static imageUploadLink(artist: string, album: string): string {
    return (
      this.baseURL +
      "music/" +
      this.encode(artist) +
      "/" +
      this.encode(album) +
      "/+images/upload"
    );
  }

  // https://www.last.fm/api/auth?api_key=xxxxxxxxxxxxx&token=xxxxxxx
  static authURL(apiKey: string, token: string) {
    return this.baseURL + "api/auth?api_key=" + apiKey + "&token=" + token;
  }

  // https://www.last.fm/user/flushed_emoji/library?from=2022-10-06&rangetype=1day
  static libraryWithDateRange(
    username: string,
    from: Date,
    to: Date | "1day" | "year" | "1month"
  ) {
    const dateFormat = (date: Date) => format(date, "y-MM-dd");

    const baseURL = `https://www.last.fm/user/${username}/library?from=${dateFormat(
      from
    )}`;

    if (to instanceof Date) {
      return `${baseURL}&to=${dateFormat(to)}}`;
    } else {
      return `${baseURL}&rangetype=${to}`;
    }
  }

  static generateTrackLinks(track: RecentTrack): TrackLinks {
    return {
      artist: this.artistPage(track.artist),
      album: this.albumPage(track.artist, track.album),
      track: this.trackPage(track.artist, track.name),
    };
  }

  static generateTrackLinksForEmbed(track: RecentTrack): TrackLinks {
    let links = this.generateTrackLinks(track);

    return {
      artist: displayLink(track.artist, links.artist),
      album: displayLink(track.album, links.album),
      track: displayLink(track.name, links.track),
    };
  }
}

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
  }

  return parseInt(number, 10);
}
