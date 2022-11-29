import { ClientError } from "./errors";

export class UnexpectedGowonError extends Error {
  name = "UnexpectedGowonError";
}

export class GuildRequiredError extends ClientError {
  name = "GuildRequiredError";

  constructor() {
    super("This command must be run in a server!");
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
