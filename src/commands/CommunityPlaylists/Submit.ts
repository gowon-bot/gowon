import { Command } from "../../lib/command/Command";
import { PlaylistSubmitEmbed } from "../../lib/views/playlistSubmissions/PlaylistSubmitEmbed";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { CommunityPlaylistService } from "../../services/communityPlaylists/CommunityPlaylistService";

export default class Submit extends Command {
  idSeed = "newjeans danielle";

  description = "Submit to a community playlist";
  subcategory = "playlists";

  communityPlaylistsService = ServiceRegistry.get(CommunityPlaylistService);

  async run() {
    const playlists = await this.communityPlaylistsService.list([
      this.requiredGuild.id,
    ]);

    const embed = new PlaylistSubmitEmbed(this.newEmbed(), playlists);

    await this.send(embed);
  }
}
