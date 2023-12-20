import { bold } from "../../../../helpers/discord";
import { emDash } from "../../../../helpers/specialCharacters";
import {
  displayNumber,
  displayNumberedList,
} from "../../../../lib/ui/displays";
import { ScrollingListView } from "../../../../lib/ui/views/ScrollingListView";
import { PlaylistChildCommand } from "./PlaylistChildCommand";

export class List extends PlaylistChildCommand {
  idSeed = "pink fantasy yechan";

  description = "Lists your Spotify playlists";

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

    this.spotifyPlaylistTagService.updatePlaylistNames(playlists.items);
    this.spotifyPlaylistTagService.updateDefaultPlaylistName(
      this.ctx,
      defaultPlaylist,
      playlists.items
    );

    const embed = this.authorEmbed()
      .setHeader("Spotify playlists")
      .setTitle("Your Spotify playlists");

    const simpleScrollingEmbed = new ScrollingListView(this.ctx, embed, {
      items: playlists.items,
      pageSize: 15,
      pageRenderer(items, { offset }) {
        return displayNumberedList(
          items.map(
            (p) =>
              `${p.tag?.emoji || "◻️"} ${bold(p.name)} (${displayNumber(
                p.tracksCount,
                "track"
              )}) ${
                defaultPlaylist?.playlistID === p.id
                  ? `${emDash} *default*`
                  : ""
              }`
          ),
          offset
        );
      },
      overrides: { itemName: "playlist" },
    });

    await this.send(simpleScrollingEmbed);
  }
}
