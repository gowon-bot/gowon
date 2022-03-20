import { LogicError } from "../../../../errors/errors";
import { bold } from "../../../../helpers/discord";
import { EmojisArgument } from "../../../../lib/context/arguments/argumentTypes/discord/EmojisArgument";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { removeEmojisFromString } from "../../../../lib/context/arguments/parsers/EmojiParser";
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
    preprocessor: removeEmojisFromString,
    required: true,
    description: "The name of the playlist to tag",
  }),
} as const;

export class Tag extends PlaylistChildCommand<typeof args> {
  idSeed = "pink fantasy momoka";

  description = "Tags one of your playlists with an emoji";
  usage = ["playlistName :emoji:"];

  arguments = args;

  validation: Validation = {
    emoji: new validators.LengthRange({
      min: 1,
      message: "Please specify an emoji!",
    }),
    playlistName: {
      validator: new validators.Required({}),
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
      throw new LogicError(`Couldn't find a playlist with that name!`);
    }

    await this.spotifyPlaylistTagService.tagPlaylist(this.ctx, dbUser, {
      playlistName: foundPlaylist.name,
      playlistID: foundPlaylist.id,
      emoji: emoji.raw,
    });

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Spotify playlist tag"))
      .setDescription(
        `Succesfully tagged ${bold(foundPlaylist.name)} as ${emoji.raw}`
      );

    await this.send(embed);
  }
}
