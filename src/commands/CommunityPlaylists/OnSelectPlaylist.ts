import { StringSelectMenuInteraction } from "discord.js";
import { InvalidPlaylistError } from "../../errors/communityPlaylists";
import { InteractionReply } from "../../lib/command/interactions/InteractionReply";
import { InteractionID } from "../../lib/command/interactions/interactions";
import { NumberArgument } from "../../lib/context/arguments/argumentTypes/NumberArgument";
import { PlaylistSubmitModal } from "../../lib/views/playlistSubmissions/PlaylistSubmitModal";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { CommunityPlaylistService } from "../../services/communityPlaylists/CommunityPlaylistService";

const args = {
  playlistID: new NumberArgument({ index: 0, required: true }),
} as const;

export default class OnSelectPlaylist extends InteractionReply<
  StringSelectMenuInteraction,
  typeof args
> {
  idSeed = "newjeans minji";
  replyTo = InteractionID.SelectPlaylist;

  arguments = args;

  shouldDefer = false;

  communityPlaylistService = ServiceRegistry.get(CommunityPlaylistService);

  async run() {
    const playlist = await this.communityPlaylistService.getPlaylistByID(
      this.parsedArguments.playlistID
    );

    if (!playlist) {
      throw new InvalidPlaylistError();
    }

    const modal = new PlaylistSubmitModal(playlist);

    await this.send(modal);
  }
}
