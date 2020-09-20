import { Track } from "../services/LastFM/LastFMService.types";

import { generateLink, generateLink as generateLinkEmbed } from "./discord";

export interface TrackLinks {
  artist: string;
  album: string;
  track: string;
}

export abstract class LinkGenerator {
  static baseURL = "https://www.last.fm/";

  static encode(string: string): string {
    return encodeURIComponent(string).replace(")", "%29");
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
}

export function parseLastFMTrackResponse(track: Track): ParsedTrack {
  return {
    artist: track.artist["#text"],
    album: track.album["#text"],
    name: track.name,
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
      .map((l) => generateLink(l.text, l.link!))
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
