import { LastFMErrorResponse } from "./services/LastFMService.types";
import { parseError } from "./helpers/error";
import { Client } from "discord.js";

export abstract class ClientError extends Error {
  message: string;
  name = "ClientError";
  isClientFacing = true;

  constructor(message: string) {
    super(message);
    this.message = message;
  }
}

export class UnknownError extends ClientError {
  name = "UnknownError";

  constructor() {
    super("An unknown error occurred");
  }
}

export class UsernameNotRegisteredError extends ClientError {
  name = "UsernameNotRegisteredError";

  constructor(username?: string) {
    super(
      username
        ? `The user ${username} doesn't have a username set.`
        : "That user doesn't have a username set."
    );
  }
}

export class LastFMConnectionError extends ClientError {
  name = "LastFMConnectionError";

  constructor() {
    super("There was a problem connecting to Last.fm");
  }
}

export class LastFMError extends ClientError {
  name = "LastFMError";

  constructor(error: LastFMErrorResponse) {
    super(parseError(error));
  }
}


