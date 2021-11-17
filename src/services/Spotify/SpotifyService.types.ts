import { SimpleMap } from "../../helpers/types";

export type SpotifyEntity =
  | "album"
  | "artist"
  | "playlist"
  | "track"
  | "show"
  | "episode";

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
  uri: string;
}

export type SearchResponse = SimpleMap<{
  href: string;
  items: SearchItem[];
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
