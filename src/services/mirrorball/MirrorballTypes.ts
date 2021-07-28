export type MirrorballDate = string;

export enum UserType {
  Lastfm = "Lastfm",
  Wavy = "Wavy",
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
}

export interface TaskStartResponse {
  taskName: string;
  token: string;
  success: boolean;
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
  title: string;
  artistName: string;
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
