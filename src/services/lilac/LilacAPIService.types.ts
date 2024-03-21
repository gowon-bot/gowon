// Types

import { LilacUser } from "./converters/user";

export type LilacDate = number;

export enum LilacProgressAction {
  Syncing = "sync",
  Updating = "update",
}

export enum LilacProgressStage {
  Fetching = "fetching",
  Inserting = "inserting",
  Terminated = "terminated",
}

export enum LilacPrivacy {
  Private = "PRIVATE",
  Discord = "DISCORD",
  FMUsername = "FMUSERNAME",
  Both = "BOTH",
  Unset = "UNSET",
}

// Inputs

export interface LilacUserInput {
  id?: number;
  discordID?: string;
  username?: string;
}

export interface LilacUserModifications {
  discordID?: string;
  username?: string;
  privacy?: LilacPrivacy;
  lastFMSession?: string;
  hasPremium?: boolean;
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

export interface LilacWhoFirstInput {
  guildID?: string;
  limit?: number;
  userIDs?: string[];
  reverse?: boolean;
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

export interface LilacAlbumFilters {
  album?: LilacAlbumInput;
  pagination?: LilacPaginationInput;
}

export interface LilacAlbumCountFilters {
  album?: LilacAlbumInput;
  users?: LilacUserInput[];
  pagination?: LilacPaginationInput;
}

export interface LilacTrackCountFilters {
  track?: LilacTrackInput;
  users?: LilacUserInput[];
  pagination?: LilacPaginationInput;
}

export interface LilacTagsFilters {
  inputs?: LilacTagInput[];
  artists?: LilacArtistInput[];
  pagination?: LilacPaginationInput;
  fetchTagsForMissing?: boolean;
}

export interface LilacRatingsFilters {
  album?: LilacAlbumInput;
  user?: LilacUserInput;
  rating?: number;
  pagination?: LilacPaginationInput;
}

// Responses
export interface SyncProgress<
  Action extends LilacProgressAction = LilacProgressAction
> {
  action: Action;
  stage: LilacProgressStage;
  current: number;
  total: number;
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
  discordID: string;
  privacy: LilacPrivacy;
  lastSynced?: LilacDate;
  isSyncing?: boolean;
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

export interface LIlacWhoFirstArtistRank {
  artist: LilacArtist;
  firstScrobbled: LilacDate;
  lastScrobbled: LilacDate;
  rank: number;
  totalListeners: number;
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
  artist: LilacArtist;
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

export interface LilacWhoFirstRow {
  user: LilacUser;
  firstScrobbled: LilacDate;
  lastScrobbled: LilacDate;
}

export interface LilacArtistCount {
  user: LilacUser;
  playcount: number;
  artist: LilacArtist;
  firstScrobbled: LilacDate;
  lastScrobbled: LilacDate;
}

export interface LilacAlbumCount {
  user: LilacUser;
  playcount: number;
  album: LilacAlbum;
  firstScrobbled: LilacDate;
  lastScrobbled: LilacDate;
}

export interface LilacTrackCount {
  user: LilacUser;
  playcount: number;
  track: LilacTrack;
}

export interface LilacAmbiguousTrackCount {
  user: LilacUser;
  playcount: number;
  track: LilacAmbiguousTrack;
  firstScrobbled: LilacDate;
  lastScrobbled: LilacDate;
}

export interface LilacRating {
  rating: number;
  rateYourMusicAlbum: LilacRateYourMusicAlbum;
}

export interface LilacRateYourMusicAlbum {
  rateYourMusicID: string;
  title: string;
  artistName: string;
  artistNativeName: string;
  releaseYear: number;
}

// Pages

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

export interface LilacAlbumsPage {
  pagination: LilacPagination;
  albums: LilacAlbum[];
}

export interface LilacAlbumCountsPage {
  pagination: LilacPagination;
  albumCounts: LilacAlbumCount[];
}

export interface LilacTrackCountsPage {
  pagination: LilacPagination;
  trackCounts: LilacTrackCount[];
}

export interface LilacAmbiguousTrackCountsPage {
  pagination: LilacPagination;
  trackCounts: LilacAmbiguousTrackCount[];
}

export interface LilacTagsPage {
  pagination: LilacPagination;
  tags: LilacTag[];
}

export interface LilacRatingsPage {
  pagination: LilacPagination;
  ratings: LilacRating[];
}
