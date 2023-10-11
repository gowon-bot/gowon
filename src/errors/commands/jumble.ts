import { ArgumentValidationError } from "../../lib/validation/validators/BaseValidator";
import { ClientError } from "../errors";

export class InvalidJumblePoolAmountError extends ArgumentValidationError {
  name = "InvalidJumblePoolAmountError";

  constructor() {
    super("Please enter a number between 5 and 1000!");
  }
}

export class NoSuitableArtistsFoundForJumbleError extends ClientError {
  name = "NoSuitableArtistsFoundForJumbleError";

  constructor() {
    super("No suitable artists were found in your library!");
  }
}
