import { ClientError } from "./errors";

export class UnexpectedGowonError extends Error {
  name = "UnexpectedGowonError";
}

export class GuildRequiredError extends ClientError {
  name = "GuildRequiredError";

  constructor() {
    super("This command cannot be run in DMs!");
  }
}

// API

export class CannotEditServerError extends ClientError {
  name = "CannotEditServerError";

  constructor() {
    super("You don't have permissions to edit this server");
  }
}

export class CannotEditUserError extends ClientError {
  name = "CannotEditUserError";

  constructor() {
    super("You don't have permissions to edit this user");
  }
}

export class OmitTriangularBracketsFromPrefixError extends ClientError {
  name = "OmitTriangularBracketsFromPrefixError";

  constructor() {
    super(
      "Please omit the triangular brackets!\neg. `@Gowon prefix <!>` should be `@Gowon prefix !`"
    );
  }
}
