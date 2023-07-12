import { SpotifyPlaylistNotFound } from "../../../errors/external/spotify/playlists";
import { bold } from "../../../helpers/discord";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { SpotifyPlaylistChildCommand } from "./SpotifyPlaylistChildCommand";

const args = {
  playlist: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "The name of the Spotify playlist to set as the default",
  }),
} satisfies ArgumentsMap;

export class SetDefault extends SpotifyPlaylistChildCommand<typeof args> {
  idSeed = "pink fantasy arang";

  aliases = ["default"];
  usage = ["playlistName"];

  description = "Sets one of your Spotify playlists as the default";

  arguments = args;

  async run() {
    await this.getMentions({ fetchSpotifyToken: true });

    const playlistName = this.parsedArguments.playlist;

    const playlists = await this.spotifyService.getPlaylists(this.ctx);

    const foundPlaylist = playlists.items.find(
      (p) =>
        p.name.toLowerCase().replaceAll(/\s+/g, " ") ===
        playlistName.toLowerCase().replaceAll(/\s+/g, " ")
    );

    if (!foundPlaylist) {
      throw new SpotifyPlaylistNotFound();
    }

    await this.spotifyPlaylistTagService.setPlaylistAsDefault(
      this.ctx,
      foundPlaylist
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Spotify default playlist"))
      .setDescription(
        `Succesfully set ${bold(foundPlaylist.name)} as your default playlist!`
      );

    await this.send(embed);
  }
}
