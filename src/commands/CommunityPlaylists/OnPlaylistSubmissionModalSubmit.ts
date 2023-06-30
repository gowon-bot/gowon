import { InteractionReply } from "../../lib/command/interactions/InteractionReply";
import { InteractionID } from "../../lib/command/interactions/interactions";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { PlaylistSubmitModal } from "../../lib/views/playlistSubmissions/PlaylistSubmitModal";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { SpotifyService } from "../../services/Spotify/SpotifyService";

const args = {
  spotifyURL: new StringArgument({
    modalFieldID: PlaylistSubmitModal.SpotifyUrlId,
  }),
  submitterName: new StringArgument({
    modalFieldID: PlaylistSubmitModal.SubmitterNameId,
  }),
} as const satisfies ArgumentsMap;

export default class OnPlaylistSubmissionModalSubmit extends InteractionReply<
  typeof args
> {
  idSeed = "newjeans hanni";
  replyTo = InteractionID.PlaylistSubmit;

  shouldDefer = false;
  arguments = args;

  spotifyService = ServiceRegistry.get(SpotifyService);

  async run() {
    await this.send(this.newEmbed().setDescription(`Successfully submitted!`));
  }
}
