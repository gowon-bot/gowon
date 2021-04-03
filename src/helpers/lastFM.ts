import { Track } from "../services/LastFM/LastFMService.types";

import {
  cleanURL,
  displayLink,
  displayLink as generateLinkEmbed,
} from "./discord";

export interface TrackLinks {
  artist: string;
  album: string;
  track: string;
}

export abstract class LinkGenerator {
  static baseURL = "https://www.last.fm/";

  static encode(string: string): string {
    return cleanURL(encodeURIComponent(string));
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
      this.baseURL + "/music/" + this.encode(artist) + "/+listeners/you-know"
    );
  }

  // https://www.last.fm/user/flushed_emoji/library/music/Red+Velvet
  static libraryArtistPage(username: string, artist: string): string {
    return (
      this.baseURL +
      "/user/" +
      this.encode(username) +
      "/library/music/" +
      this.encode(artist)
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
      "/user/" +
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
      "/user/" +
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
      "/music/" +
      this.encode(artist) +
      "/" +
      this.encode(album) +
      "/+images/upload"
    );
  }

  static generateTrackLinks(track: Track): TrackLinks {
    return {
      artist: this.artistPage(track.artist["#text"]),
      album: this.albumPage(track.artist["#text"], track.album["#text"]),
      track: this.trackPage(track.artist["#text"], track.name),
    };
  }

  static generateTrackLinksForEmbed(track: Track): TrackLinks {
    let links = this.generateTrackLinks(track);

    return {
      artist: generateLinkEmbed(track.artist["#text"], links.artist),
      album: generateLinkEmbed(track.album["#text"], links.album),
      track: generateLinkEmbed(track.name, links.track),
    };
  }
}

export interface ParsedTrack {
  artist: string;
  album: string;
  name: string;
  nowPlaying: boolean;
}

export function parseLastFMTrackResponse(track: Track): ParsedTrack {
  return {
    artist: track.artist["#text"],
    album: track.album["#text"],
    name: track.name,
    nowPlaying: track["@attr"]?.nowplaying === "true",
  };
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
