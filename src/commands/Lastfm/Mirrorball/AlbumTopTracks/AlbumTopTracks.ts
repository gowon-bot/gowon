import { IndexerError, LogicError } from "../../../../errors";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { IndexingBaseCommand } from "../../../../lib/indexing/IndexingCommand";
import {
  AlbumTopTracksConnector,
  AlbumTopTracksParams,
  AlbumTopTracksResponse,
} from "./AlbumTopTracks.connector";
import { displayNumber } from "../../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class AlbumTopTracks extends IndexingBaseCommand<
  AlbumTopTracksResponse,
  AlbumTopTracksParams,
  typeof args
> {
  connector = new AlbumTopTracksConnector();

  idSeed = "shasha sunhye";

  aliases = ["ltt"];
  subcategory = "library";
  description = "Displays your top scrobbled tracks from an album";

  rollout = {
    guilds: this.indexerGuilds,
  };

  arguments: Arguments = args;

  async run() {
    const { username, senderUser, senderRequestable, dbUser, perspective } =
      await this.parseMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
        reverseLookup: { required: true },
      });

    const { artist: artistName, album: albumName } =
      await this.lastFMArguments.getAlbum(senderRequestable, true);

    const user = (dbUser || senderUser)!;

    await this.throwIfNotIndexed(user, perspective);

    const response = await this.query({
      album: { name: albumName, artist: { name: artistName } },
      user: { discordID: user.discordID },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError(errors.errors[0].message);
    }

    const { topTracks, album } = response.albumTopTracks;

    if (topTracks.length < 1) {
      throw new LogicError(
        `${
          perspective.plusToHave
        } no scrobbles of any songs from ${album.name.italic()} by ${album.artist.name.strong()}!`
      );
    }
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
      { itemName: "track" }
    );

    simpleScrollingEmbed.send();
  }
}
