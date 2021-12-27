import { Arguments } from "../../../../lib/arguments/arguments";
import {
  displayNumber,
  displayNumberedList,
} from "../../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { PlaylistChildCommand } from "./PlaylistChildCommand";

const args = {
  flags: {
    private: {
      description: "Shows your private playlists",
      shortnames: ["p"],
      longnames: ["private"],
    },
  },
} as const;

export class List extends PlaylistChildCommand<typeof args> {
  idSeed = "pink fantasy yechan";

  description = "Lists your Spotify playlists";

  arguments: Arguments = args;

  async run() {
    const { dbUser } = await this.getMentions({ fetchSpotifyToken: true });

    const playlists = await this.spotifyService.getPlaylists(this.ctx);

    await this.spotifyPlaylistTagService.getTagsForPlaylists(
      this.ctx,
      dbUser,
      playlists.items
    );

    const defaultPlaylist = this.spotifyPlaylistTagService.getDefaultPlaylist(
      this.ctx
    );

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Spotify playlists"))
      .setTitle(
        `Your public${
          this.parsedArguments.private ? " and private" : ""
        } Spotify playlists`
      );

    const simpleScrollingEmbed = new SimpleScrollingEmbed(this.message, embed, {
      items: playlists.items.filter(
        (p) => this.parsedArguments.private || p.isPublic
      ),
      pageSize: 15,
      pageRenderer(items, { offset }) {
        return displayNumberedList(
          items.map(
            (p) =>
              `${p.tag?.emoji || "◻️"} ${p.name.strong()} (${displayNumber(
                p.tracksCount,
                "track"
              )})${defaultPlaylist?.playlistID === p.id ? " **default**" : ""}`
          ),
          offset
        );
      },
      overrides: { itemName: "playlist" },
    });

    simpleScrollingEmbed.send();
  }
}
