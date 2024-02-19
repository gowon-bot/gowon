import { bold, italic } from "../../helpers/discord";
import { Perspective } from "../../lib/Perspective";
import { ClientError } from "../errors";

export class UserHasNoCrownsInServerError extends ClientError {
  name = "UserHasNoCrownsInServerError";

  constructor(perspective: Perspective) {
    super(`${perspective.plusToHave} no crowns in this server!`);
  }
}

export class AlreadyCrownBannedError extends ClientError {
  name = "AlreadyCrownBannedError";

  constructor() {
    super("that user is already crown banned!");
  }
}

export class NotCrownBannedError extends ClientError {
  name = "NotCrownBannedError";

  constructor() {
    super("that user isn't crown banned!");
  }
}

export class ArtistAlreadyCrownBannedError extends ClientError {
  name = "ArtistAlreadyCrownBannedError";

  constructor() {
    super("that artist has already been crown banned!");
  }
}

export class ArtistNotCrownBannedError extends ClientError {
  name = "ArtistNotCrownBannedError";

  constructor() {
    super("that artist is already not crown banned!");
  }
}

export class NoContentiousCrownsError extends ClientError {
  name = "NoContentiousCrownsError";

  constructor() {
    super("No crowns have been stolen in this server yet!");
  }
}

export class NoCrownHistoryError extends ClientError {
  name = "NoCrownHistoryError";

  constructor(artistName: string) {
    super(`There is no history for the ${bold(artistName)} crown yet!`);
  }
}

export class CrownDoesntExistError extends ClientError {
  name = "CrownDoesntExistError";

  constructor(artistName?: string, caseSensitive?: boolean) {
    super(
      `A crown for ${
        artistName ? bold(artistName) : "that artist"
      } doesn't exist yet!` +
        (caseSensitive
          ? italic(
              " Please ensure the artist exactly matches the artist name on the crown!"
            )
          : "")
    );
  }
}

export class ArtistIsCrownBannedError extends ClientError {
  name = "ArtistIsCrownBannedError";

  constructor(artist: string) {
    super(`It is not possible to get the crown for ${bold(artist)}!`);
  }
}
