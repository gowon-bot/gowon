import { ClientError } from "./errors";

export class CannotChangePrefixError extends ClientError {
  name = "CannotChangePrefixError";

  constructor() {
    super(
      "You don't have the correct permissions to change the prefix! You need the 'Administrator' Discord permission to change the prefix"
    );
  }
}
