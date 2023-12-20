import {
  CouldNotFindPlaylistWithTagError,
  CouldNotFindTrackToChangePlaylistError,
} from "../../../../errors/external/spotify";
import { bold, italic } from "../../../../helpers/discord";
import { Variation } from "../../../../lib/command/Command";
import { EmojisArgument } from "../../../../lib/context/arguments/argumentTypes/discord/EmojisArgument";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { EmojiParser } from "../../../../lib/context/arguments/parsers/EmojiParser";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { PlaylistChildCommand } from "./PlaylistChildCommand";

const args = {
  playlist: new EmojisArgument({
    default: [],
    description: "The tag of the playlist to add the song to",
  }),
  artist: new StringArgument({
    index: 0,
    splitOn: "|",
    preprocessor: EmojiParser.removeEmojisFromString,
    description: "That artist of the track you want to add",
  }),
  track: new StringArgument({
    index: 1,
    splitOn: "|",
    preprocessor: EmojiParser.removeEmojisFromString,
    description: "That track of the track you want to add",
  }),
} satisfies ArgumentsMap;

export class Add extends PlaylistChildCommand<typeof args> {
  idSeed = "pink fantasy harin";

  description = "Adds a song to one of your Spotify playlists";
  usage = ["artist | song", "artist | song :playlistTagEmoji:"];

  variations: Variation[] = [
    {
      name: "remove",
      description: "Removes a song from one of your Spotify playlists",
      variation: ["remove"],
      separateSlashCommand: true,
    },
  ];

  arguments = args;

  async run() {
    const remove = this.variationWasUsed("remove");
    const [emoji] = this.parsedArguments.playlist;

    const { senderRequestable, dbUser } = await this.getMentions({
      fetchSpotifyToken: true,
    });

    const playlistTag = await this.spotifyPlaylistTagService.getPlaylistFromTag(
      this.ctx,
      dbUser,
      emoji
    );

    if (!playlistTag) {
      throw new CouldNotFindPlaylistWithTagError(this.prefix, emoji);
    }

    const { track, askedConfirmation } = await this.spotifyArguments.getTrack(
      this.ctx,
      senderRequestable,
      { confirm: true }
    );

    if (!track) {
      if (askedConfirmation) return;

      throw new CouldNotFindTrackToChangePlaylistError(remove);
    }

    await this.spotifyService[remove ? "removeFromPlaylist" : "addToPlaylist"](
      this.ctx,
      playlistTag.playlistID,
      [track.uri.asString]
    );

    const embed = this.authorEmbed()
      .setHeader(`${remove ? "Remove from" : "Add to"} playlist`)
      .setDescription(
        `Successfully ${remove ? "removed" : "added"} ${italic(track.name)} ${
          remove ? "from" : "to"
        } ${bold(playlistTag.playlistName)}`
      )
      .setThumbnail(track.album.images.largest.url);

    await this.send(embed);
  }
}
