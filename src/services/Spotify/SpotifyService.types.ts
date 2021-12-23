import { SimpleMap } from "../../helpers/types";

export type SpotifyEntityName =
  | "album"
  | "artist"
  | "playlist"
  | "track"
  | "show"
  | "episode";

export type RawSpotifyURI<T extends SpotifyEntityName> =
  `spotify:${T}:${string}`;

export interface SpotifyToken {
  access_token: string;
  token_type: "bearer";
  expires_in: number;
}

export interface PersonalSpotifyToken extends SpotifyToken {
  fetchedAt: number;
}

export type RawSearch<T> = {
  href: string;
  items: T[];
  limit: string;
  next: string | undefined;
  offset: null;
  previous: string | undefined;
  total: number;
};

export type RawSearchResponse<T> = SimpleMap<RawSearch<T>>;

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

export type SpotifyAvailableMarket = string;
export type SpotifyAlbumType = "album" | "single" | "compilation";
export type SpotifyReleaseDatePrecision = "year" | "month" | "day";
export type SpotifyRestrictionReason = "market" | "product" | "explicit";

export interface SpotifyImage {
  height: number;
  url: string;
  width: number;
}

export interface SpotifyExternalURLs<T extends SpotifyEntityName> {
  spotify: `http://open.spotify.com/${T}/${string}`;
}

export interface SpotifyExternalIDs {
  isrc: string;
}

export interface RawBaseSpotifyEntity<T extends SpotifyEntityName> {
  external_urls: SpotifyExternalURLs<T>;
  href: string;
  id: string;
  uri: RawSpotifyURI<T>;
  name: string;
  type: T;

  // This isn't on the response from Spotify
  isExactMatch?: boolean;
}

export interface RawSpotifyArtist extends RawBaseSpotifyEntity<"artist"> {
  images: SpotifyImage[];
  genres: [];
  followers: {
    href: string;
    total: number;
  };
  popularity: number;
}

export interface RawSpotifyAlbum extends RawBaseSpotifyEntity<"album"> {
  album_type: SpotifyAlbumType;
  artists: RawSpotifyArtist[];
  available_markets: string[];
  images: SpotifyImage[];
  release_date: string;
  release_date_precision: SpotifyReleaseDatePrecision;
  restrictions?: {
    reason: SpotifyRestrictionReason;
  };
  total_tracks: number;
}

export interface RawSpotifyTrack extends RawBaseSpotifyEntity<"track"> {
  album: RawSpotifyAlbum;
  artists: RawSpotifyArtist[];
  available_markets: SpotifyAvailableMarket[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: SpotifyExternalIDs;
  is_local: boolean;
  popularity: number;
  preview_url: string;
  track_number: number;
}
