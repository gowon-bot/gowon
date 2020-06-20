import { LastFMErrorResponse } from "./services/LastFMService.types";
import { parseError } from "./helpers/error";
import { Response } from "node-fetch";

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
  response: Response;

  constructor(response: Response) {
    super("There was a problem connecting to Last.fm");
    this.response = response;
  }
}

export class LastFMError extends ClientError {
  name = "LastFMError";

  constructor(error: LastFMErrorResponse) {
    super(parseError(error));
  }
}

export class AlreadyLoggedOutError extends ClientError {
  name = "AlreadyLoggedOutError";

  constructor() {
    super("You are already logged out!");
  }
}

export class AlreadyFriendsError extends ClientError {
  name = "AlreadyFriendsError";

  constructor() {
    super("You are already friends with that user");
  }
}

export class NotFriendsError extends ClientError {
  name = "NotFriendsError";

  constructor() {
    super("You were already not friends with that user");
  }
}

export class LastFMUserDoesntExistError extends ClientError {
  name = "LastFMUserDoesntExistError";

  constructor() {
    super("That user doesn't exist in Last.fm");
  }
}
