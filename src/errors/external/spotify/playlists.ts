import { EmojiMention } from "../../../lib/context/arguments/parsers/EmojiParser";
import { ClientError } from "../../errors";

export class CannotFindTaggedSpotifyPlaylistError extends ClientError {
  name = "CannotFindTaggedSpotifyPlaylistError";

  constructor(emoji: EmojiMention, prefix: string) {
    super(
      emoji
        ? `Couldn't find a playlist tagged with ${emoji.resolvable}!`
        : `Couldn't find a default playlist! (Set one with \`${prefix}pl default\`)`
    );
  }
}

export class CouldNotFindTrackInSpotifyPlaylist extends ClientError {
  name = "CouldNotFindTrackInSpotifyPlaylist";

  constructor(isRemove: boolean) {
    super(
      `Couldn't find a track to ${
        isRemove ? "remove from" : "add to"
      } a playlist!`
    );
  }
}

export class SpotifyPlaylistNotFound extends ClientError {
  name = "SpotifyPlaylistNotFound";

  constructor() {
    super("Couldn't find a Spotify playlist with that name!");
  }
}
