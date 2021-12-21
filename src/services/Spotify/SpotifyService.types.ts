import { SimpleMap } from "../../helpers/types";

export type SpotifyEntity =
  | "album"
  | "artist"
  | "playlist"
  | "track"
  | "show"
  | "episode";

export type SpotifyURI<T extends SpotifyEntity> = `spotify:${T}:${string}`;
export type SpotifyTrackURI = SpotifyURI<"track">;

export interface SpotifyToken {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface PersonalSpotifyToken extends SpotifyToken {
  fetchedAt: number;
}

export interface Image {
  height: number;
  width: number;
  url: string;
}

export interface SearchItem {
  external_urls: {
    spotify: string;
  };
  genres: [];
  href: string;
  id: string;
  images: Image[];
  popularity: 0;
  name: string;
  type: SpotifyEntity;
  uri: SpotifyURI<SpotifyEntity>;
}

export type SearchResponse<T> = SimpleMap<{
  href: string;
  items: T[];
  limit: string;
  next: string | undefined;
  offset: null;
  previous: string | undefined;
  total: number;
}>;

export interface SpotifyAuthUser {
  discordID: string;
  state: string;
}

export interface SpotifyCode {
  code: string;
  state: string;
}

export interface SpotifyCodeError {
  error: string;
  state: string;
}

export type SpotifyCodeResponse = SpotifyCode | SpotifyCodeError;

export function isSpotifyCodeError(
  response: SpotifyCodeResponse
): response is SpotifyCodeError {
  return !(response as SpotifyCode).code;
}

export class InvalidStateError extends Error {
  name = "InvalidStateError";

  constructor() {
    super("The provided state didn't match the expected state");
  }
}

export interface SpotifySimpleArtist {
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  name: string;
  type: string;
  uri: SpotifyURI<"artist">;
}

export interface SpotifyTrack {
  album: {
    album_type: string;
    artists: SpotifySimpleArtist[];
    available_markets: string[];
    external_urls: {
      spotify: string;
    };
    href: string;
    id: string;
    images: {
      height: number;
      url: string;
      width: number;
    }[];
    name: string;
    release_date: string;
    release_date_precision: string;
    total_tracks: number;
    type: string;
    uri: SpotifyURI<"album">;
  };
  artists: SpotifySimpleArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: {
    isrc: string;
  };
  external_urls: {
    spotify: string;
  };
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: SpotifyURI<"track">;

  // This isn't on the response from Spotify
  isExactMatch?: boolean;
}
