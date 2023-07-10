import { ClientError } from "./errors";

export class UserAlreadySubmittedError extends ClientError {
  name = "UserAlreadySubmittedError";

  constructor() {
    super(`That user has already submitted to this playlist!`);
  }
}

export class InvalidSpotifyURLSubmissionError extends ClientError {
  name = "InvalidSpotifyURLSubmissionError";

  constructor() {
    super(`That's not a valid Spotify track URL`);
  }
}

export class InvalidPlaylistError extends ClientError {
  name = "InvalidPlaylistError";

  constructor() {
    super(`That's not a valid playlist!`);
  }
}
