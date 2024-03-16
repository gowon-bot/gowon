import { NoScrobblesFromAlbumError } from "../../../errors/commands/library";
import { bold, italic } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { displayNumber } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LilacAlbumsService } from "../../../services/lilac/LilacAlbumsService";
import { LilacTracksService } from "../../../services/lilac/LilacTracksService";

const args = {
  ...prefabArguments.album,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class AlbumTopTracks extends LilacBaseCommand<typeof args> {
  idSeed = "shasha sunhye";

  aliases = ["ltt"];
  subcategory = "library";
  description = "Displays your top scrobbled tracks from an album";

  slashCommand = true;

  arguments = args;

  lilacTracksService = ServiceRegistry.get(LilacTracksService);
  lilacAlbumsService = ServiceRegistry.get(LilacAlbumsService);

  async run() {
    const { username, dbUser, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
        dbUserRequired: true,
        syncedRequired: true,
      });

    const { artist: artistName, album: albumName } =
      await this.lastFMArguments.getAlbum(this.ctx, senderRequestable, {
        redirect: true,
      });

    const { trackCounts: topTracks } = await this.lilacTracksService.listCounts(
      this.ctx,
      {
        track: { artist: { name: artistName }, album: { name: albumName } },
        users: [{ discordID: dbUser.discordID }],
      }
    );

    const album = await this.lilacAlbumsService.correctAlbumName(this.ctx, {
      artist: artistName,
      name: albumName,
    });

    if (topTracks.length < 1) {
      throw new NoScrobblesFromAlbumError(
        perspective,
        album.artist,
        album.name
      );
    }

    const embed = this.minimalEmbed()
      .setTitle(
        `${Emoji.usesIndexedDataLink} Top tracks on ${italic(
          album.name
        )} by ${bold(album.artist)} for ${username}`
      )
      .setURL(LastfmLinks.libraryAlbumPage(username, album.artist, album.name));

    const totalScrobbles = topTracks.reduce((sum, t) => sum + t.playcount, 0);
    const average = totalScrobbles / topTracks.length;

    const simpleScrollingEmbed = new ScrollingListView(this.ctx, embed, {
      pageSize: 15,
      items: topTracks,

      pageRenderer(tracks) {
        return tracks
          .map(
            (track) =>
              `${displayNumber(track.playcount, "play")} - ${bold(
                track.track.name
              )}`
          )
          .join("\n");
      },

      overrides: {
        itemName: "track",
        embedDescription:
          italic(
            `${displayNumber(
              totalScrobbles,
              "total scrobble"
            )}, ${displayNumber(
              topTracks.length,
              "total track"
            )}, ${displayNumber(
              average.toFixed(0),
              "average scrobble"
            )} per track`
          ) + "\n",
      },
    });

    await this.reply(simpleScrollingEmbed);
  }
}
