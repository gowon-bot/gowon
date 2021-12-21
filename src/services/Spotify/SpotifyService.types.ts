import { SimpleMap } from "../../helpers/types";

export type SpotifyEntityName =
  | "album"
  | "artist"
  | "playlist"
  | "track"
  | "show"
  | "episode";

export type SpotifyURI<T extends SpotifyEntityName> = `spotify:${T}:${string}`;
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

export interface SearchItem extends BaseSpotifyEntity<SpotifyEntityName> {
  href: string;
  id: string;
  images: Image[];
  popularity: 0;
  name: string;
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

export type SpotifyAvailableMarket = string;

export interface BaseSpotifyEntity<T extends SpotifyEntityName> {
  external_urls: SpotifyExternalURLs<T>;
  href: string;
  id: string;
  uri: SpotifyURI<T>;
  name: string;
  type: string;

  // This isn't on the response from Spotify
  isExactMatch?: boolean;
}

export interface SpotifySimpleArtist extends BaseSpotifyEntity<"artist"> {
  genres: [];
  followers: {
    href: string;
    total: number;
  };
  popularity: number;
}

export type SpotifyAlbumType = "album" | "single" | "compilation";
export type SpotifyReleaseDatePrecision = "year" | "month" | "day";
export type SpotifyRestrictionReason = "market" | "product" | "explicit";

export interface SpotifyAlbum extends BaseSpotifyEntity<"album"> {
  album_type: SpotifyAlbumType;
  artists: SpotifySimpleArtist[];
  available_markets: string[];
  images: SpotifyImage[];
  release_date: string;
  release_date_precision: SpotifyReleaseDatePrecision;
  restrictions?: {
    reason: SpotifyRestrictionReason;
  };
  total_tracks: number;
}

export interface SpotifyTrack extends BaseSpotifyEntity<"track"> {
  album: SpotifyAlbum;
  artists: SpotifySimpleArtist[];
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
