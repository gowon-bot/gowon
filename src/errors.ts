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

export class BadAmountError extends ClientError {
  name = "BadAmountError";

  constructor(min: number, max: number) {
    super(
      `That is not a valid amount, please enter an amount between ${min} and ${max}`
    );
  }
}

export class CommandAlreadyDisabledError extends ClientError {
  name = "CommandAlreadyDisabled";

  constructor() {
    super("That command is already disabled");
  }
}

export class CommandNotFoundError extends ClientError {
  name = "CommandNotFoundError";

  constructor() {
    super("That command was not found!");
  }
}

export class CommandNotDisabledError extends ClientError {
  name = "CommandNotDisabledError";

  constructor() {
    super("That command is already enabled!");
  }
}

export class MismatchedPermissionsError extends ClientError {
  name = "MismatchedPermissionsError";

  constructor(isBlacklist: boolean) {
    super(
      `Permissions for that command are **${
        isBlacklist ? "blacklist" : "whitelist"
      }-based**. You cannot mix white and blacklists.`
    );
  }
}

export class PermissionsAlreadySetError extends ClientError {
  name = "PermissionsAlreadySetError";

  constructor(isBlacklist: boolean) {
    super(
      "That command has already been " + isBlacklist
        ? "blacklisted"
        : "whitelisted" + "for that user/role"
    );
  }
}

export class LogicError extends ClientError {
  name = "LogicError";

  constructor(msg: string) {
    super(msg);
  }
}

export class RecordNotFoundError extends ClientError {
  name = "RecordNotFoundError";

  constructor(recordName: string) {
    super(`That ${recordName} wasn't found!`);
  }
}
