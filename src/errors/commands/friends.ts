import { displayNumber } from "../../lib/ui/displays";
import { ClientError } from "../errors";

export class NoFriendsError extends ClientError {
  name = "NoFriendsError";

  constructor() {
    super("You don't have any friends :(");
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

export class AlreadyFriendsError extends ClientError {
  name = "AlreadyFriendsError";

  constructor() {
    super("you are already friends with that user");
  }
}

export class AlreadyNotFriendsError extends ClientError {
  name = "NotFriendsError";

  constructor() {
    super("you were already not friends with that user");
  }
}

export class InvalidFriendUsernameError extends ClientError {
  name = "InvalidFriendUsernameError";

  constructor() {
    super(`Please enter a valid friend username!`);
  }
}

export class NotFriendsError extends ClientError {
  name = "NotFriendsError";

  constructor() {
    super(`You are not friends with that user!`);
  }
}

export class AliasRequiredError extends ClientError {
  name = "AliasRequiredError";

  constructor() {
    super(`Please enter an alias!`);
  }
}

export class FriendsHaveNoScrobblesOfArtistError extends ClientError {
  name = "FriendsHaveNoScrobblesOfArtistError";

  constructor() {
    super("Neither you nor your friends have scrobbled this artist!");
  }
}

export class FriendsHaveNoRatingsError extends ClientError {
  name = "FriendsHaveNoRatingsError";

  constructor() {
    super("Couldn't find that album in your or your friends' ratings!");
  }
}

export class NoFriendsToAddError extends ClientError {
  name = "NoFriendsToAddError";

  constructor() {
    super("Please specify some friends to add!");
  }
}
