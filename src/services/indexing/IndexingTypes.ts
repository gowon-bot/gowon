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
