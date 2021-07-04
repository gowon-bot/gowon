import { ErrorResponse } from "../../lib/indexing/MirrorballCommands";

export enum IndexerErrorResponses {
  UserDoesntExist = "That user doesn't exist",
  ArtistDoesntExist = "That artist doesn't exist",
}

export function responseHasError(
  response: ErrorResponse,
  error: IndexerErrorResponses
): boolean {
  return !!response.errors.find((e) => e.message === error);
}
