import { code } from "../helpers/discord";
import { ClientError } from "./errors";

export class NoAlbumsFoundInSearchError extends ClientError {
  name = "NoAlbumsFoundInSearchError";

  constructor(searchString: string) {
    super(
      `Couldn't find any albums from Last.fm! Searched with ${code(
        searchString
      )}`,
      "To enter an exact album, use 'artist | album'"
    );
  }
}

export class NoTracksFoundInSearchError extends ClientError {
  name = "NoTracksFoundInSearchError";

  constructor(searchString: string) {
    super(
      `Couldn't find any tracks from Last.fm! Searched with ${code(
        searchString
      )}`,
      "To enter an exact track, use 'artist | track'"
    );
  }
}
