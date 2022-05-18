// Types

export type LilacProgressAction = "indexing" | "updating";

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
