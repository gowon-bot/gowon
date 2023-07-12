import { PlaylistSubmitEmbed } from "../../lib/views/communityPlaylists/PlaylistSubmitEmbed";
import { CommunityPlaylistChildCommand } from "./CommunityPlaylistsChildCommand";

export class Submit extends CommunityPlaylistChildCommand {
  idSeed = "newjeans danielle";

  description = "Submit to a community playlist";

  async run() {
    const playlists = await this.communityPlaylistService.list([
      this.requiredGuild.id,
    ]);

    const embed = new PlaylistSubmitEmbed(this.newEmbed(), playlists);

    await this.send(embed);
  }
}
