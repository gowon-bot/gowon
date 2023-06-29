import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { CommunityPlaylist } from "../../../database/entity/playlists/CommunityPlaylist";
import { InteractionID } from "../../command/interactions/interactions";
import { SendableModal } from "../base";

export class PlaylistSubmitModal extends SendableModal {
  static SpotifyUrlId = "spotify-url";
  static SubmitterNameId = "submitter-name";

  constructor(private playlist: CommunityPlaylist) {
    super();
  }

  present(): ModalBuilder {
    const modal = new ModalBuilder()
      .setCustomId(InteractionID.PlaylistSubmit)
      .setTitle(`Submit to ${this.playlist.title}`);

    const submitterNameInput = new TextInputBuilder()
      .setCustomId(PlaylistSubmitModal.SubmitterNameId)
      .setLabel("Please enter a name")
      .setPlaceholder("(defaults to your Discord username)")
      .setRequired(false)
      .setStyle(TextInputStyle.Short);

    const spotifyURLInput = new TextInputBuilder()
      .setCustomId(PlaylistSubmitModal.SpotifyUrlId)
      .setLabel("Please enter a Spotify song URL")
      .setRequired(true)
      .setPlaceholder(
        "eg. https://open.spotify.com/track/1DzpZ8HBR0MgGkZDhAdd7f"
      )
      .setStyle(TextInputStyle.Short);

    const firstActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        submitterNameInput
      );
    const secondActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(spotifyURLInput);

    modal.addComponents(firstActionRow, secondActionRow);

    return modal;
  }
}
