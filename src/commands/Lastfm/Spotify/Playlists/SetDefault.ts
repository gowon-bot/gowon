import { LogicError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { PlaylistChildCommand } from "./PlaylistChildCommand";

const args = {
  inputs: {
    playlistName: { index: { start: 0 } },
  },
} as const;

export class SetDefault extends PlaylistChildCommand<typeof args> {
  idSeed = "pink fantasy arang";

  aliases = ["default"];

  description = "Sets one of your playlists as the default";

  arguments: Arguments = args;

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
    await this.getMentions({ fetchSpotifyToken: true });

    const playlistName = this.parsedArguments.playlistName!;

    const playlists = await this.spotifyService.getPlaylists(this.ctx);

    const foundPlaylist = playlists.items.find(
      (p) =>
        p.name.toLowerCase().replaceAll(/\s+/g, " ") ===
        playlistName.toLowerCase().replaceAll(/\s+/g, " ")
    );

    if (!foundPlaylist) {
      throw new LogicError(`Couldn't find a playlist with that name!`);
    }

    await this.spotifyPlaylistTagService.setPlaylistAsDefault(
      this.ctx,
      foundPlaylist
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Spotify default playlist"))
      .setDescription(
        `Succesfully set ${foundPlaylist.name.strong()} as your default playlist!`
      );

    await this.send(embed);
  }
}
