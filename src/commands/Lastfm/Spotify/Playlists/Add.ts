import { LogicError } from "../../../../errors";
import { Variation } from "../../../../lib/command/BaseCommand";
import { EmojisArgument } from "../../../../lib/context/arguments/argumentTypes/discord/EmojisArgument";
import { Flag } from "../../../../lib/context/arguments/argumentTypes/Flag";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { removeEmojisFromString } from "../../../../lib/context/arguments/parsers/EmojiParser";
import { PlaylistChildCommand } from "./PlaylistChildCommand";

const args = {
  playlistTag: new EmojisArgument({ default: [] }),
  artist: new StringArgument({
    index: 0,
    splitOn: "|",
    preprocessor: removeEmojisFromString,
  }),
  track: new StringArgument({
    index: 1,
    splitOn: "|",
    preprocessor: removeEmojisFromString,
  }),

  private: new Flag({
    description: "Shows your private playlists",
    shortnames: ["p"],
    longnames: ["private"],
  }),
} as const;

export class Add extends PlaylistChildCommand<typeof args> {
  idSeed = "pink fantasy harin";

  description = "Adds a song to one of your Spotify playlists";

  variations: Variation[] = [
    {
      name: "remove",
      description: "Removes a song from one of your Spotify playlists",
      variation: ["remove"],
    },
  ];

  arguments = args;

  async run() {
    const remove = this.variationWasUsed("remove");
    const [emoji] = this.parsedArguments.playlistTag;

    const { senderRequestable, dbUser } = await this.getMentions({
      fetchSpotifyToken: true,
    });

    this.access.checkAndThrow(dbUser);

    const playlistTag = await this.spotifyPlaylistTagService.getPlaylistFromTag(
      this.ctx,
      dbUser,
      emoji
    );

    if (!playlistTag) {
      throw new LogicError(
        emoji
          ? `Couldn't find a playlist tagged with ${emoji.resolvable}!`
          : `Couldn't find a default playlist! (Set one with \`${this.prefix}pl default\`)`
      );
    }

    const track = await this.spotifyArguments.getTrack(
      this.ctx,
      senderRequestable,
      { confirm: true }
    );

    if (!track) {
      throw new LogicError(
        `Couldn't find a track to ${
          remove ? "remove from" : "add to"
        } a playlist!`
      );
    }

    await this.spotifyService[remove ? "removeFromPlaylist" : "addToPlaylist"](
      this.ctx,
      playlistTag.playlistID,
      [track.uri.asString]
    );

    const embed = this.newEmbed()
      .setAuthor(
        this.generateEmbedAuthor(
          `${remove ? "Remove from" : "Add to"} playlist`
        )
      )
      .setDescription(
        `Successfully ${remove ? "removed" : "added"} ${track.name.italic()} ${
          remove ? "from" : "to"
        } ${playlistTag.playlistName.strong()}`
      )
      .setThumbnail(track.album.images.largest.url);

    await this.send(embed);
  }
}
