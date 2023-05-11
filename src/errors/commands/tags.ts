import { ClientError } from "../errors";

export class TagAlreadyBannedError extends ClientError {
  name = "TagAlreadyBannedError";

  constructor(guildID: string | undefined) {
    super(
      `That tag has already been banned ${
        guildID ? "in this server" : "bot-wide"
      }!`,
      "Note: bans are case insensitive and spaces are ignored"
    );
  }
}
export class TagNotBannedError extends ClientError {
  name = "TagNotBannedError";

  constructor(guildID: string | undefined) {
    super(
      `That tag hasn't been banned ${guildID ? "in this server" : "bot-wide"}!`
    );
  }
}
export class TagBannedByDefaultError extends ClientError {
  name = "TagBannedByDefaultError";

  constructor() {
    super("That tag is banned by default bot-wide!");
  }
}

export class TagNotAllowedError extends ClientError {
  name = "TagNotAllowedError";

  constructor() {
    super("That tag has been banned from being used!");
  }
}
