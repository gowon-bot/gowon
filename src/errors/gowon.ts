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

// Arguments

// Not client-facing
export class ArgumentNotImplementedForInteractionTypeError extends Error {
  name = "ArgumentNotImplementedForInteractionTypeError";

  constructor() {
    super("This argument cannot be parsed from the provided interaction");
  }
}
