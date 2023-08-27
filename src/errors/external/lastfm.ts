import { code } from "../../helpers/discord";
import { LastfmLinks } from "../../helpers/lastfm/LastfmLinks";
import { displayLink } from "../../lib/views/displays";
import { ClientError } from "../errors";

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
        LastfmLinks.imageUploadLink(artist, album)
      )}.`
    );
  }
}

export class NoAlbumForCoverError extends ClientError {
  name = "NoAlbumForCoverError";

  constructor() {
    super("There is no album to show a cover for");
  }
}

export class TrackAlreadyLovedError extends ClientError {
  name = "TrackAlreadyLovedError";

  constructor() {
    super(`That track was already loved on Last.fm`);
  }
}
