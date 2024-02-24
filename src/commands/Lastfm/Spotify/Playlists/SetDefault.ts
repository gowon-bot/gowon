import { LogicError } from "../../../../errors/errors";
import { bold } from "../../../../helpers/discord";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { SuccessEmbed } from "../../../../lib/ui/embeds/SuccessEmbed";
import { PlaylistChildCommand } from "./PlaylistChildCommand";

const args = {
  playlist: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "The name of the playlist to set as the default",
  }),
} satisfies ArgumentsMap;

export class SetDefault extends PlaylistChildCommand<typeof args> {
  idSeed = "pink fantasy arang";

  aliases = ["default"];
  usage = ["playlistName"];

  description = "Sets one of your playlists as the default";

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
      throw new LogicError(`Couldn't find a playlist with that name!`);
    }

    await this.spotifyPlaylistTagService.setPlaylistAsDefault(
      this.ctx,
      foundPlaylist
    );

    const embed = new SuccessEmbed().setDescription(
      `Succesfully set ${bold(
        foundPlaylist.name
      )} as your default Spotify playlist!`
    );

    await this.reply(embed);
  }
}
