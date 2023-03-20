import { Response } from "node-fetch";
import { bold } from "../helpers/discord";
import { parseError, parseErrorSix } from "../helpers/error";
import { Emoji } from "../lib/Emoji";
import { displayNumber } from "../lib/views/displays";
import { RawLastFMErrorResponse } from "../services/LastFM/LastFMService.types";

export abstract class ClientError extends Error {
  name = "ClientError";
  isClientFacing = true;
  silent = false;

  constructor(public message: string, public footer = "") {
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

  constructor(error: RawLastFMErrorResponse, isInIssueMode = false) {
    super(parseError(error));
    this.response = error;
    this.name = "LastFMError:" + error.error;
    this.footer = isInIssueMode
      ? "Last.fm is experiencing a high amount of errors at the moment"
      : "";
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

export class CommandNotFoundError extends ClientError {
  name = "CommandNotFoundError";

  constructor() {
    super("that command was not found!");
  }
}

export class LogicError extends ClientError {
  name = "LogicError";

  /**
   * @deprecated Use a custom created error class instead of LogicError
   */
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

  constructor(limit: number, prefix: string, showPatreon = false) {
    super(
      `you cannot have more than ${displayNumber(limit, "friend")}`,
      showPatreon
        ? `You can become a Patron to increase your limit to 15. See \`${prefix}patreon\` for more information.`
        : ""
    );
  }
}

export class BadLastFMResponseError extends ClientError {
  name = "BadLastFMResponseError";

  constructor() {
    super(
      Emoji[404] +
        " Last.fm is having issues at the moment, please try again later..."
    );
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
    super(`it is not possible to get the crown for ${bold(artist)}!`);
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

export class DMsAreOffError extends ClientError {
  name = "DMsAreOffError";

  constructor() {
    super(
      "You have your DMs turned off! Please re-enable them to allow Gowon to DM you."
    );
  }
}

export class AccessDeniedError extends ClientError {
  name = "AccessDeniedError";

  constructor() {
    super("You don't have access to run this command!");
  }
}

export class CommandInBetaError extends ClientError {
  name = "CommandInBetaError";

  constructor() {
    super(
      "This command is still in beta!\nStay tuned for more info in the support server: https://discord.gg/9Vr7Df7TZf"
    );
  }
}

export class TagAlreadyBannedError extends ClientError {
  name = "TagAlreadyBannedError";

  constructor() {
    super(
      "That tag has already been banned in this server!",
      "Note: bans are case insensitive and spaces are ignored"
    );
  }
}
export class TagNotBannedError extends ClientError {
  name = "TagNotBannedError";

  constructor() {
    super("That tag hasn't been banned in this server!");
  }
}
export class TagBannedByDefaultError extends ClientError {
  name = "TagBannedByDefaultError";

  constructor() {
    super("That tag is banned by default bot-wide!");
  }
}

export class UpdatingDisabledBecauseOfIssueModeError extends ClientError {
  name = "UpdatingDisabledBecauseOfIssueModeError";

  constructor() {
    super(
      "Because Last.fm is experiencing a high degree of errors right now, updating has been disabled to prevent data corruption.\n\nPlease try again later."
    );
  }
}

export class IndexingDisabledBecauseOfIssueModeError extends ClientError {
  name = "IndexingDisabledBecauseOfIssueModeError";

  constructor() {
    super(
      "Because Last.fm is experiencing a high degree of errors right now, indexing has been disabled to prevent data corruption.\n\nPlease try again later."
    );
  }
}

export class CannotBeUsedAsASlashCommand extends ClientError {
  name = "CantBeUsedAsASlashCommand";

  constructor() {
    super("This command cannot be used as a slash command yet!");
  }
}

export class TagNotAllowedError extends ClientError {
  name = "TagNotAllowedError";

  constructor() {
    super("That tag has been banned from being used!");
  }
}
