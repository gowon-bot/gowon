import { code } from "../helpers/discord";
import { LinkGenerator } from "../helpers/lastFM";
import { displayLink } from "../lib/views/displays";
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

export class AlbumHasNoCoverError extends ClientError {
  super = "AlbumHasNoCoverError";

  constructor(artist: string, album: string) {
    super(
      `That album doesn't have a cover yet! You can add one ${displayLink(
        "here",
        LinkGenerator.imageUploadLink(artist, album)
      )}.`
    );
  }
}
