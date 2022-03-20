import { MirrorballError, LogicError } from "../../../../errors/errors";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  AlbumTopTracksConnector,
  AlbumTopTracksParams,
  AlbumTopTracksResponse,
} from "./AlbumTopTracks.connector";
import { displayNumber } from "../../../../lib/views/displays";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../../lib/context/arguments/prefabArguments";
import { bold, italic } from "../../../../helpers/discord";

const args = {
  ...prefabArguments.album,
  ...standardMentions,
} as const;

export default class AlbumTopTracks extends MirrorballBaseCommand<
  AlbumTopTracksResponse,
  AlbumTopTracksParams,
  typeof args
> {
  connector = new AlbumTopTracksConnector();

  idSeed = "shasha sunhye";

  aliases = ["ltt"];
  subcategory = "library";
  description = "Displays your top scrobbled tracks from an album";

  slashCommand = true;

  arguments = args;

  async run() {
    const { username, dbUser, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
        reverseLookup: { required: true },
        requireIndexed: true,
      });

    const { artist: artistName, album: albumName } =
      await this.lastFMArguments.getAlbum(this.ctx, senderRequestable, true);

    const response = await this.query({
      album: { name: albumName, artist: { name: artistName } },
      user: { discordID: dbUser.discordID },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    const { topTracks, album } = response.albumTopTracks;

    if (topTracks.length < 1) {
      throw new LogicError(
        `${perspective.plusToHave} no scrobbles of any songs from ${italic(
          album.name
        )} by ${bold(album.artist.name)}!`
      );
    }

    const totalScrobbles = topTracks.reduce((sum, t) => sum + t.playcount, 0);
    const average = totalScrobbles / topTracks.length;

    const embed = this.newEmbed()
      .setTitle(
        `Top tracks on ${italic(album.name)} by ${bold(
          album.artist.name
        )} for ${username}`
      )
      .setURL(
        LinkGenerator.libraryAlbumPage(username, album.artist.name, album.name)
      );

    const simpleScrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      pageSize: 15,
      items: topTracks,

      pageRenderer(tracks) {
        return tracks
          .map(
            (track) =>
              `${displayNumber(track.playcount, "play")} - ${bold(track.name)}`
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
              average.toFixed(2),
              "average scrobble"
            )} per track`
          ) + "\n",
      },
    });

    simpleScrollingEmbed.send();
  }
}
