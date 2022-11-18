// Types

import { ArtistInput } from "../mirrorball/MirrorballTypes";
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

export interface LilacTrackInput {
  name?: string;
  artist?: LilacArtistInput;
  album?: LilacArtistInput;
}

export interface LilacTagInput {
  name?: string;
}

export interface LilacWhoKnowsInput {
  guildID?: string;
  limit?: number;
  userIDs?: string[];
}

export interface LilacPaginationInput {
  page: number;
  perPage: number;
}

export interface LilacScrobbleFilters {
  artist?: LilacArtistInput;
  album?: LilacAlbumInput;
  track?: LilacTrackInput;
  user?: LilacUserInput;
  pagination?: LilacPaginationInput;
}

export interface LilacArtistFilters {
  fetchTagsForMissing?: boolean;
  inputs?: LilacArtistInput[];
  pagination?: LilacPaginationInput;
  tags?: LilacTagInput[];
}

export interface LilacArtistCountFilters {
  fetchTagsForMissing?: boolean;
  artists?: LilacArtistInput[];
  users?: LilacUserInput[];
  pagination?: LilacPaginationInput;
  tags?: LilacTagInput[];
}

export interface LilacTagsFilters {
  inputs?: LilacTagInput[];
  artists?: ArtistInput[];
  pagination?: LilacPaginationInput;
  fetchTagsForMissing?: boolean;
}

// Responses
export interface IndexingProgress<
  Action extends LilacProgressAction = LilacProgressAction
> {
  action: Action;
  page: number;
  totalPages: number;
}

export interface LilacPagination {
  currentPage: number;
  perPage: number;
  totalItems: number;
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

  above: LilacAlbumCount;
  below: LilacAlbumCount;
}

export interface LilacWhoKnowsTrackRank {
  track: LilacAmbiguousTrack;
  playcount: number;
  rank: number;
  totalListeners: number;

  above: LilacAmbiguousTrackCount;
  below: LilacAmbiguousTrackCount;
}

// Objects
export interface LilacArtist {
  id: number;
  name: string;

  tags: LilacTag[];
}

export interface LilacAlbum {
  id: number;
  name: string;
  artist: LilacAlbum;
}

export interface LilacTrack {
  id: number;
  name: string;
  artist: LilacArtist;
  album?: LilacAlbum;
}

export interface LilacTag {
  name: string;
  occurrences?: number;
}

export interface LilacAmbiguousTrack {
  name: string;
  artist: LilacArtist;
}

export interface LilacScrobble {
  artist: LilacArtist;
  album: LilacAlbum;
  track: LilacTrack;

  scrobbledAt: LilacDate;
  user: RawLilacUser;
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

export interface LilacAlbumCount {
  user: LilacUser;
  playcount: number;
  album: LilacAlbum;
}

export interface LilacAmbiguousTrackCount {
  user: LilacUser;
  playcount: number;
  album: LilacAlbum;
}

export interface LilacScrobblesPage {
  pagination: LilacPagination;
  scrobbles: LilacScrobble[];
}

export interface LilacArtistsPage {
  pagination: LilacPagination;
  artists: LilacArtist[];
}

export interface LilacArtistCountsPage {
  pagination: LilacPagination;
  artistCounts: LilacArtistCount[];
}

export interface LilacTagsPage {
  pagination: LilacPagination;
  tags: LilacTag[];
}
