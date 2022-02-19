import { MirrorballError, LogicError } from "../../../../errors";
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

const args = {
  ...standardMentions,
  ...prefabArguments.album,
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

  arguments = args;

  async run() {
    const { username, dbUser, senderRequestable, perspective } =
      await this.parseMentions({
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
        `${
          perspective.plusToHave
        } no scrobbles of any songs from ${album.name.italic()} by ${album.artist.name.strong()}!`
      );
    }

    const totalScrobbles = topTracks.reduce((sum, t) => sum + t.playcount, 0);
    const average = totalScrobbles / topTracks.length;

    const embed = this.newEmbed()
      .setTitle(
        `Top tracks on ${album.name.italic()} by ${album.artist.name.strong()} for ${username}`
      )
      .setURL(
        LinkGenerator.libraryAlbumPage(username, album.artist.name, album.name)
      );

    const simpleScrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        pageSize: 15,
        items: topTracks,

        pageRenderer(tracks) {
          return tracks
            .map(
              (track) =>
                `${displayNumber(
                  track.playcount,
                  "play"
                )} - ${track.name.strong()}`
            )
            .join("\n");
        },
      },
      {
        itemName: "track",
        embedDescription:
          `${displayNumber(totalScrobbles, "total scrobble")}, ${displayNumber(
            topTracks.length,
            "total track"
          )}, ${displayNumber(
            average.toFixed(2),
            "average scrobble"
          )} per track`.italic() + "\n",
      }
    );

    simpleScrollingEmbed.send();
  }
}
