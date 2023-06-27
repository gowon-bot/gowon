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
  constructor(private playlist: CommunityPlaylist) {
    super();
  }

  present(): ModalBuilder {
    const modal = new ModalBuilder()
      .setCustomId(InteractionID.PlaylistSubmit)
      .setTitle(`Submit to ${this.playlist.title}`);

    // Create the text input components
    const favoriteColorInput = new TextInputBuilder()
      .setCustomId("favoriteColorInput")
      // The label is the prompt the user sees for this input
      .setLabel("What's your favorite color?")
      // Short means only a single line of text
      .setStyle(TextInputStyle.Short);

    const hobbiesInput = new TextInputBuilder()
      .setCustomId("hobbiesInput")
      .setLabel("What's some of your favorite hobbies?")
      // Paragraph means multiple lines of text.
      .setStyle(TextInputStyle.Paragraph);

    const firstActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        favoriteColorInput
      );
    const secondActionRow =
      new ActionRowBuilder<TextInputBuilder>().addComponents(hobbiesInput);

    modal.addComponents(firstActionRow, secondActionRow);

    return modal;
  }
}
