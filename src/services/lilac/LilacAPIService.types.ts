// Types

import { LilacUser } from "./converters/user";

export type LilacDate = number;

export type LilacProgressAction = "indexing" | "updating";

export enum LilacPrivacy {
  Private = "private",
  Discord = "discord",
  FMUsername = "fmusername",
  Both = "both",
  Unset = "unset",
}

// Inputs

export interface LilacUserInput {
  id?: number;
  discordID?: string;
  username?: string;
}

export interface LilacArtistInput {
  name?: string;
}

export interface LilacAlbumInput {
  name?: string;
  artist?: LilacArtistInput;
}

export interface LilacWhoKnowsInput {
  guildID?: string;
  limit?: number;
  userIDs?: string[];
}

// Responses
export interface IndexingProgress<
  Action extends LilacProgressAction = LilacProgressAction
> {
  action: Action;
  page: number;
  totalPages: number;
}

export interface RawLilacUser {
  id: number;
  username: string;
  discordId: string;
  privacy: LilacPrivacy;
  lastIndexed?: LilacDate;
}

export interface LilacWhoKnowsArtistRank {
  artist: LilacArtist;
  playcount: number;
  rank: number;
  totalListeners: number;

  above: LilacArtistCount;
  below: LilacArtistCount;
}

export interface LilacWhoKnowsAlbumRank {
  album: LilacAlbum;
  playcount: number;
  rank: number;
  totalListeners: number;

  above: LilacArtistCount;
  below: LilacArtistCount;
}

// Objects
export interface LilacArtist {
  id: number;
  name: string;
}

export interface LilacAlbum {
  id: number;
  name: string;
  artist: LilacAlbum;
}

export interface LilacWhoKnowsRow {
  user: LilacUser;
  playcount: number;
}

export interface LilacArtistCount {
  user: LilacUser;
  playcount: number;
  artist: LilacArtist;
}
