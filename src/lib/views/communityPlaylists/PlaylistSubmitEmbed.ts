import {
  ActionRowBuilder,
  EmbedBuilder,
  MessageCreateOptions,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";
import { CommunityPlaylist } from "../../../database/entity/playlists/CommunityPlaylist";
import { InteractionID } from "../../command/interactions/interactions";
import { Emoji } from "../../emoji/Emoji";
import { SendableComponent } from "../base";

export class PlaylistSubmitEmbed extends SendableComponent {
  private embed: EmbedBuilder;
  private row: ActionRowBuilder<any>;

  constructor(embed: EmbedBuilder, playlists: CommunityPlaylist[]) {
    super();

    this.embed = embed
      .setTitle("Submit to a playlist")
      .setDescription("Please pick a playlist to submit to:");

    const playlistSelect = this.createPlaylistSelect(playlists);

    this.row = new ActionRowBuilder().addComponents(playlistSelect);
  }

  present(): MessageCreateOptions {
    return {
      embeds: [this.embed],
      components: [this.row],
    };
  }

  createPlaylistSelect(
    playlists: CommunityPlaylist[]
  ): StringSelectMenuBuilder {
    return new StringSelectMenuBuilder()
      .setCustomId(InteractionID.SelectPlaylist)
      .setPlaceholder("Pick a playlist")
      .addOptions(
        ...playlists.map((p) =>
          new StringSelectMenuOptionBuilder()
            .setLabel(p.title)
            .setDescription(p.description)
            .setValue(`${p.id}`)
            .setEmoji(p.emoji || Emoji.defaultPlaylistEmoji)
        )
      );
  }
}
