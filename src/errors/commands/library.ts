import { bold, italic, mentionGuildMember } from "../../helpers/discord";
import { Perspective } from "../../lib/Perspective";
import { ClientError } from "../errors";

export class NoScrobblesOfAnyAlbumsFromArtistError extends ClientError {
  constructor(perspective: Perspective, artistName: string) {
    super(
      `${perspective.plusToHave} no scrobbles of any albums from ${bold(
        artistName
      )}!`
    );
  }
}

export class NoScrobblesOfTrackError extends ClientError {
  constructor(perspective: Perspective, artistName: string, trackName: string) {
    super(
      `${perspective.plusToHave} no scrobbles for ${italic(
        trackName
      )} by ${bold(artistName)}!`
    );
  }
}

export class NoScrobblesFromAlbumError extends ClientError {
  constructor(perspective: Perspective, artistName: string, albumName: string) {
    super(
      `${perspective.plusToHave} no scrobbles of any songs from ${italic(
        albumName
      )} by ${bold(artistName)}!`
    );
  }
}

export class NoScrobblesOfArtistError extends ClientError {
  constructor(
    perspective: Perspective,
    artistName: string,
    redirectHelp: string
  ) {
    super(
      `${perspective.plusToHave} no scrobbles of any songs from ${bold(
        artistName
      )}!${redirectHelp ? "\n\n" : ""}${redirectHelp}`
    );
  }
}

export class NoScrobblesOfAlbumError extends ClientError {
  constructor(perspective: Perspective, artistName: string, albumName: string) {
    super(
      `${perspective.plusToHave} no scrobbles of any songs from ${italic(
        albumName
      )} by ${bold(artistName)}!`
    );
  }
}

export class NoRatingsFromArtistError extends ClientError {
  constructor(perspective: Perspective) {
    super(
      `Couldn't find any albums by that artist in ${perspective.possessive} ratings!`
    );
  }
}

export class TooManySearchResultsError extends ClientError {
  constructor() {
    super("Too many search results, try narrowing down your query");
  }
}

export class WrongFileFormatAttachedError extends ClientError {
  constructor() {
    super("Please attach a file with the correct format");
  }
}

export class CouldNotFindRatingError extends ClientError {
  constructor() {
    super("Couldn't find that album in your ratings!");
  }
}

export class NoImportedRatingsFound extends ClientError {
  constructor(prefix: string) {
    super(
      `You don't have any ratings imported yet! To import your ratings see \`${prefix}rym help\``
    );
  }
}

export class NoUserToCompareRatingsToError extends ClientError {
  constructor() {
    super("Please mention a user to compare your ratings with!");
  }
}

export class MentionedUserHasNoRatingsError extends ClientError {
  constructor() {
    super("The user you mentioned doesn't have any ratings!");
  }
}

export class NoSharedRatingsError extends ClientError {
  constructor(userID: string) {
    super(
      `You and ${mentionGuildMember(
        userID
      )} share no common ratings! (try using the --lenient flag to allow for larger differences)`
    );
  }
}
