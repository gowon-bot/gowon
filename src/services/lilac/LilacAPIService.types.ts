// Types

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

export type LilacUserInput = Partial<{
  id: number;
  discordID: string;
  username: string;
}>;

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
