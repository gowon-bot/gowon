import { ModalSubmitInteraction } from "discord.js";
import { CommunityPlaylistSubmission } from "../../database/entity/playlists/CommunityPlaylistSubmission";
import {
  InvalidPlaylistError,
  InvalidSpotifyURLSubmissionError,
} from "../../errors/communityPlaylists";
import { InteractionReply } from "../../lib/command/interactions/InteractionReply";
import { InteractionID } from "../../lib/command/interactions/interactions";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { PlaylistSubmitModal } from "../../lib/views/communityPlaylists/PlaylistSubmitModal";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { SpotifyArguments } from "../../services/Spotify/SpotifyArguments";
import { SpotifyService } from "../../services/Spotify/SpotifyService";
import { CommunityPlaylistService } from "../../services/communityPlaylists/CommunityPlaylistService";

const args = {
  spotifyURL: new StringArgument({
    modalFieldID: PlaylistSubmitModal.SpotifyUrlId,
    required: true,
  }),
  submitterName: new StringArgument({
    modalFieldID: PlaylistSubmitModal.SubmitterNameId,
  }),
} as const satisfies ArgumentsMap;

export default class OnPlaylistSubmissionModalSubmit extends InteractionReply<
  ModalSubmitInteraction,
  typeof args
> {
  idSeed = "newjeans hanni";
  replyTo = InteractionID.PlaylistSubmit;

  shouldDefer = false;
  arguments = args;

  spotifyService = ServiceRegistry.get(SpotifyService);
  spotifyArguments = ServiceRegistry.get(SpotifyArguments);
  communityPlaylistService = ServiceRegistry.get(CommunityPlaylistService);

  async run() {
    const spotifyURL = this.parsedArguments.spotifyURL;

    if (
      !this.spotifyArguments.containsLink(
        spotifyURL,
        this.spotifyArguments.trackLinkRegex
      )
    ) {
      throw new InvalidSpotifyURLSubmissionError();
    }

    const submitterUser = await this.usersService.getUser(
      this.ctx,
      this.author.id
    );

    const playlist = await this.communityPlaylistService.getPlaylistByID(
      this.getInteractionParameter()
    );

    if (!playlist) {
      throw new InvalidPlaylistError();
    }

    const spotifyURI = this.spotifyArguments.getSpotifyTrackURI(spotifyURL);

    const playlistSubmission = CommunityPlaylistSubmission.create({
      submitterName: this.parsedArguments.submitterName,
      playlist,
      submitterUser,
      spotifyURI: spotifyURI.asString,
    });

    await this.communityPlaylistService.submit(
      this.ctx,
      playlist!,
      playlistSubmission
    );

    await this.send(this.newEmbed().setDescription(`Successfully submitted!`));
  }
}
