export type MirrorballDate = string;

export enum MirrorballUserType {
  Lastfm = "Lastfm",
  Wavy = "Wavy",
}

export enum MirrorballPrivacy {
  Private = "PRIVATE",
  Discord = "DISCORD",
  FMUsername = "FMUSERNAME",
  Both = "BOTH",
  Unset = "UNSET",
}

export interface UserInput {
  discordID?: string;
  lastFMUsername?: string;
  wavyUsername?: string;
}

export interface ArtistInput {
  name?: string;
}

export interface AlbumInput {
  name?: string;
  artist?: ArtistInput;
}

export interface TrackInput {
  name?: string;
  artist?: ArtistInput;
  album?: AlbumInput;
}

export interface WhoKnowsSettings {
  guildID?: string;
  limit?: number;
  userIDs?: string[];
}

export interface TaskStartResponse {
  taskName: string;
  token: string;
  success: boolean;
}

export interface MirrorballUser {
  id: number;
  username: string;
  discordID: string;

  userType: MirrorballUserType;
  privacy: MirrorballPrivacy;
}

export interface MirrorballArtist {
  name: string;
}

export interface MirrorballAlbum {
  name: string;
  artist: MirrorballArtist;
}

export interface MirrorballAmbiguousTrack {
  name: string;
  artist: string;
}

export interface MirrorballTrack {
  name: string;
  artist: MirrorballArtist;
  album: MirrorballAlbum;
}

export interface MirrorballRateYourMusicAlbum {
  rateYourMusicID: string;
  title: string;
  artistName: string;
  releaseYear: number;
}

export interface MirrorballPageInfo {
  recordCount: number;
}

export interface MirrorballRating {
  rating: number;
  rateYourMusicAlbum: MirrorballRateYourMusicAlbum;
}

export interface MirrorballTag {
  name: string;
  occurrences: number;
}

export interface MirrorballTimerange {
  from: MirrorballDate;
  to: MirrorballDate;
}

export interface MirrorballPlay {
  track: MirrorballTrack;
  scrobbledAt: MirrorballDate;
}

export interface PageInput {
  limit: number;
  offset: number;
}

export interface PlaysInput {
  timerange?: MirrorballTimerange;
  user?: UserInput;
  sort?: string;
}

export interface PlaysParams {
  playsInput?: PlaysInput;
  pageInput?: PageInput;
}

export interface MirrorballArtistCount {
  playcount: number;
  user: MirrorballUser;
}
