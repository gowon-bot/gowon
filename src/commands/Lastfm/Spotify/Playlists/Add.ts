import { LogicError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import {
  EmojiParser,
  removeEmojisFromString,
} from "../../../../lib/arguments/custom/EmojiParser";
import { PlaylistChildCommand } from "./PlaylistChildCommand";

const args = {
  inputs: {
    playlistTag: {
      index: 0,
      custom(messageString: string) {
        return new EmojiParser(messageString).parseAll();
      },
    },
    artist: { index: 0, splitOn: "|", preprocessor: removeEmojisFromString },
    track: { index: 1, splitOn: "|", preprocessor: removeEmojisFromString },
  },
  flags: {
    private: {
      description: "Shows your private playlists",
      shortnames: ["p"],
      longnames: ["private"],
    },
  },
} as const;

export class Add extends PlaylistChildCommand<typeof args> {
  idSeed = "pink fantasy harin";

  description = "Adds a song to one of your Spotify playlists";

  arguments: Arguments = args;

  async run() {
    const [emoji] = this.parsedArguments.playlistTag!;

    const { senderRequestable, dbUser } = await this.getMentions({
      fetchSpotifyToken: true,
    });

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
      throw new LogicError("Couldn't find a track to add to a playlist!");
    }

    await this.spotifyService.addToPlaylist(this.ctx, playlistTag.playlistID, [
      track.uri.asString,
    ]);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Add to playlist"))
      .setDescription(
        `Successfully added ${track.name.italic()} to ${playlistTag.playlistName.strong()}`
      )
      .setThumbnail(track.album.images.largest.url);

    await this.send(embed);
  }
}
