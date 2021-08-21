import { RawLastFMErrorResponse } from "./services/LastFM/LastFMService.types";
import { parseError, parseErrorSix } from "./helpers/error";
import { Response } from "node-fetch";
import { displayNumber } from "./lib/views/displays";
import { Emoji } from "./lib/Emoji";

export abstract class ClientError extends Error {
  name = "ClientError";
  isClientFacing = true;
  silent = false;

  constructor(public message: string) {
    super(message);
  }
}

export class UnknownError extends ClientError {
  name = "UnknownError";

  constructor() {
    super("an unknown error occurred");
  }
}

export class UsernameNotRegisteredError extends ClientError {
  name = "UsernameNotRegisteredError";

  constructor(isAuthor?: boolean);
  constructor(username?: string);
  constructor(username?: string | boolean) {
    super(
      typeof username === "boolean"
        ? "you don't have a username set!"
        : username
        ? `the user ${username} doesn't have a username set!`
        : "that user doesn't have a username set!"
    );
  }
}

export class LastFMConnectionError extends ClientError {
  name = "LastFMConnectionError";
  response: Response;

  constructor(response: Response) {
    super("there was a problem connecting to Last.fm " + Emoji.shitsfucked);
    this.response = response;
  }
}

export class LastFMError extends ClientError {
  name = "LastFMError";
  response: RawLastFMErrorResponse;

  constructor(error: RawLastFMErrorResponse) {
    super(parseError(error));
    this.response = error;
    this.name = "LastFMError:" + error.error;
  }
}

export class AlreadyLoggedOutError extends ClientError {
  name = "AlreadyLoggedOutError";

  constructor() {
    super("you are already logged out!");
  }
}

export class AlreadyFriendsError extends ClientError {
  name = "AlreadyFriendsError";

  constructor() {
    super("you are already friends with that user");
  }
}

export class NotFriendsError extends ClientError {
  name = "NotFriendsError";

  constructor() {
    super("you were already not friends with that user");
  }
}

export class LastFMUserDoesntExistError extends ClientError {
  name = "LastFMUserDoesntExistError";

  constructor() {
    super("that user doesn't exist in Last.fm");
  }
}

export class BadAmountError extends ClientError {
  name = "BadAmountError";

  constructor(min: number, max: number) {
    super(
      `that is not a valid amount, please enter an amount between ${min} and ${max}`
    );
  }
}

export class CommandAlreadyDisabledError extends ClientError {
  name = "CommandAlreadyDisabled";

  constructor() {
    super("that command is already disabled");
  }
}

export class CommandNotFoundError extends ClientError {
  name = "CommandNotFoundError";

  constructor() {
    super("that command was not found!");
  }
}

export class CommandNotDisabledError extends ClientError {
  name = "CommandNotDisabledError";

  constructor() {
    super("that command is already enabled!");
  }
}

export class MismatchedPermissionsError extends ClientError {
  name = "MismatchedPermissionsError";

  constructor(isBlacklist: boolean) {
    super(
      `permissions for that command are **${
        isBlacklist ? "blacklist" : "whitelist"
      }-based**. You cannot mix white and blacklists.`
    );
  }
}

export class PermissionsAlreadySetError extends ClientError {
  name = "PermissionsAlreadySetError";

  constructor(isBlacklist: boolean) {
    super(
      "that command has already been " + isBlacklist
        ? "blacklisted"
        : "whitelisted" + "for that user/role"
    );
  }
}

export class LogicError extends ClientError {
  name = "LogicError";

  constructor(msg: string, public footer = "") {
    super(msg);
  }
}

export class RecordNotFoundError extends ClientError {
  name = "RecordNotFoundError";

  constructor(recordName: string) {
    super(`that ${recordName} wasn't found!`);
  }
}

export class DuplicateRecordError extends ClientError {
  name = "DuplicateRecordError";

  constructor(recordName: string) {
    super(`that ${recordName} already exists!`);
  }
}

export class InactiveError extends ClientError {
  name = "InactiveError";

  constructor() {
    super(
      "you are currently marked as inactive on the server. This is usually updated when you become an active user again, if you think this is an error please speak to a staff member. Otherwise this role should automatically removed after you chat a bit more."
    );
  }
}

export class PurgatoryError extends ClientError {
  name = "PurgatoryError";

  constructor() {
    super(
      "you have been placed in scrobble purgatory, this means you cannot participate in the crowns game. If you think this is an error please speak to a staff member."
    );
  }
}

export class OptedOutError extends ClientError {
  name = "OptedOutError";

  constructor() {
    super("you have opted out of the crowns game!");
  }
}

export class TooManyFriendsError extends ClientError {
  name = "TooManyFriendsError";

  constructor(limit: number) {
    super(`you cannot have more than ${displayNumber(limit, "friend")}`);
  }
}

export class BadLastFMResponseError extends ClientError {
  name = "BadLastFMResponseError";

  constructor() {
    super("Last.fm is having issues at the moment, please try again later...");
  }
}

export class AlreadyBannedError extends ClientError {
  name = "AlreadyBannedError";

  constructor() {
    super("that user is already banned!");
  }
}

export class NotBannedError extends ClientError {
  name = "NotBannedError";

  constructor() {
    super("that user isn't banned!");
  }
}

export class CrownBannedError extends ClientError {
  name = "CrownBannedError";

  constructor() {
    super(
      "you have been banned from the crowns game. If you think this is an error please speak to a staff member."
    );
  }
}

export class FriendNotFoundError extends ClientError {
  name = "FriendNotFoundError";

  constructor() {
    super("one of your friends doesn't exist!");
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

export class ArtistCrownBannedError extends ClientError {
  name = "ArtistCrownBannedError";

  constructor(artist: string) {
    super(`it is not possible to get the crown for ${artist.strong()}!`);
  }
}

export class PM2ConnectionError extends ClientError {
  name = "PM2ConnectionError";

  constructor() {
    super(
      "Couldn't connect to PM2! Check that you have pm2 installed and running!"
    );
  }
}

export class LastFMEntityNotFoundError extends ClientError {
  name = "LastFMEntityNotFoundError";

  constructor(entity: "artist" | "album" | "track" | "user") {
    super(parseErrorSix(entity));
  }
}

export class MirrorballError extends ClientError {
  name = "MirrorballError";
}

export class UnknownMirrorballError extends ClientError {
  name = "UnknownMirrorballError";

  constructor() {
    super("Something went wrong while communicating with the indexing server.");
  }
}

export class UserNotIndexedError extends ClientError {
  name = "UserNotIndexedError";

  constructor() {
    super("That user hasn't been indexed yet!");
  }
}

export class SenderUserNotIndexedError extends ClientError {
  name = "SenderUserNotIndexedError";

  constructor(prefix?: string) {
    super(
      `You need to be indexed to run this command, run \`${prefix}index\` to index yourself`
    );
  }
}

export class MentionedUserNotIndexedError extends ClientError {
  name = "SenderUserNotIndexedError";

  constructor(prefix?: string) {
    super(
      `The user you mentioned hasn't been indexed yet, or isn't signed into the bot.\n*Run \`${prefix}index\` to index yourself*`
    );
  }
}

export class LastFMReverseLookupError extends ClientError {
  name = "LastFMReverseLookupError";

  constructor(username: string, requireIndexed = false, prefix?: string) {
    super(
      requireIndexed
        ? `The user you mentioned hasn't been indexed yet, or isn't signed into the bot.\n*Run \`${prefix}index\` to index yourself*`
        : `This command requires that \`${username}\` be signed into Gowon!`
    );
  }
}
