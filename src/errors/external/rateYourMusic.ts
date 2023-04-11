import { Perspective } from "../../lib/Perspective";
import { ClientError } from "../errors";

export class AlreadyImportingRatingsError extends ClientError {
  name = "AlreadyImportingRatingsError";

  constructor() {
    super(
      "Your ratings are already being processed, please wait until Gowon is finished until trying again!"
    );
  }
}

export class NoRatingsError extends ClientError {
  name = "NoRatingsError";

  constructor(prefix: string, rating?: number, perspective?: Perspective) {
    super(
      rating
        ? `Couldn't find any albums rated ${perspective?.plusToHave} rated ${rating}`
        : `Couldn't find any ratings! See \`${prefix}ryms help\` for help on how to import`
    );
  }
}
