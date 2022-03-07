import { LogicError } from "../../../../errors/errors";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { PlaylistChildCommand } from "./PlaylistChildCommand";

const args = {
  playlistName: new StringArgument({ index: { start: 0 }, required: true }),
} as const;

export class SetDefault extends PlaylistChildCommand<typeof args> {
  idSeed = "pink fantasy arang";

  aliases = ["default"];

  description = "Sets one of your playlists as the default";

  arguments = args;

  async run() {
    const { dbUser } = await this.getMentions({ fetchSpotifyToken: true });

    this.access.checkAndThrow(dbUser);

    const playlistName = this.parsedArguments.playlistName;

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
