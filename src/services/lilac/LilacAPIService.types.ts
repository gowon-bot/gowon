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

// Objects
export interface LilacArtist {
  id: number;
  name: string;
}

export interface LilacWhoKnowsRow {
  user: LilacUser;
  playcount: number;
}
