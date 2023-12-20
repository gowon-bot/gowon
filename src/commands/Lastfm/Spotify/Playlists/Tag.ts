import { PlaylistNotFoundError } from "../../../../errors/external/spotify";
import { bold } from "../../../../helpers/discord";
import { EmojisArgument } from "../../../../lib/context/arguments/argumentTypes/discord/EmojisArgument";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { EmojiParser } from "../../../../lib/context/arguments/parsers/EmojiParser";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { PlaylistChildCommand } from "./PlaylistChildCommand";

const args = {
  emoji: new EmojisArgument({
    default: [],
    description: "The emoji to tag the playlist with",
    required: true,
  }),
  playlist: new StringArgument({
    preprocessor: EmojiParser.removeEmojisFromString,
    required: true,
    description: "The name of the playlist to tag",
    index: { start: 0 },
  }),
} satisfies ArgumentsMap;

export class Tag extends PlaylistChildCommand<typeof args> {
  idSeed = "pink fantasy momoka";

  description = "Tags one of your playlists with an emoji";
  usage = ["playlistName :emoji:"];

  arguments = args;

  validation: Validation = {
    emoji: new validators.LengthRangeValidator({
      min: 1,
      message: "Please specify an emoji!",
    }),
    playlistName: {
      validator: new validators.RequiredValidator({}),
      friendlyName: "playlist name",
    },
  };

  async run() {
    const { dbUser } = await this.getMentions({ fetchSpotifyToken: true });

    const playlistName = this.parsedArguments.playlist,
      [emoji] = this.parsedArguments.emoji;

    const playlists = await this.spotifyService.getPlaylists(this.ctx);

    const foundPlaylist = playlists.items.find(
      (p) =>
        p.name.toLowerCase().replaceAll(/\s+/g, " ") ===
        playlistName.toLowerCase().replaceAll(/\s+/g, " ")
    );

    if (!foundPlaylist) {
      throw new PlaylistNotFoundError();
    }

    await this.spotifyPlaylistTagService.tagPlaylist(this.ctx, dbUser, {
      playlistName: foundPlaylist.name,
      playlistID: foundPlaylist.id,
      emoji: emoji.raw,
    });

    const embed = this.authorEmbed()
      .setHeader("Spotify playlist tag")
      .setDescription(
        `Succesfully tagged ${bold(foundPlaylist.name)} as ${emoji.raw}`
      );

    await this.send(embed);
  }
}
