import { bold } from "../../helpers/discord";
import { ClientError } from "../errors";

export class TagAlreadyBannedError extends ClientError {
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
  constructor(guildID: string | undefined) {
    super(
      `That tag hasn't been banned ${guildID ? "in this server" : "bot-wide"}!`
    );
  }
}
export class TagBannedByDefaultError extends ClientError {
  constructor() {
    super("That tag is banned by default bot-wide!");
  }
}

export class TagNotAllowedError extends ClientError {
  constructor() {
    super("That tag has been banned from being used!");
  }
}

export class CouldNotFindAnyTagsForArtistError extends ClientError {
  constructor(artistName: string) {
    super(`Couldn't find any tags for ${bold(artistName)}`);
  }
}
