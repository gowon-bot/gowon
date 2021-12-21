import { MirrorballError, LogicError } from "../../../../errors";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  ArtistTopAlbumsConnector,
  ArtistTopAlbumsParams,
  ArtistTopAlbumsResponse,
} from "./ArtistTopAlbums.connector";
import { displayNumber } from "../../../../lib/views/displays";
import { FLAGS } from "../../../../lib/arguments/flags";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  flags: {
    noRedirect: FLAGS.noRedirect,
  },
  mentions: standardMentions,
} as const;

export default class ArtistTopAlbums extends MirrorballBaseCommand<
  ArtistTopAlbumsResponse,
  ArtistTopAlbumsParams,
  typeof args
> {
  connector = new ArtistTopAlbumsConnector();

  subcategory = "library";
  idSeed = "redsquare bomin";

  aliases = ["atl", "iatl"];

  description = "Displays your top scrobbled albums from an artist";

  arguments: Arguments = args;

  async run() {
    const { username, dbUser, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
        reverseLookup: { required: true },
        requireIndexed: true,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      !this.parsedArguments.noRedirect
    );

    const response = await this.query({
      artist: { name: artistName },
      user: { discordID: dbUser.discordID },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    const { topAlbums, artist } = response.artistTopAlbums;

    if (topAlbums.length < 1) {
      throw new LogicError(
        `${
          perspective.plusToHave
        } no scrobbles of any albums from ${artist.name.strong()}!`
      );
    }

    const totalScrobbles = topAlbums.reduce((sum, l) => sum + l.playcount, 0);
    const average = totalScrobbles / topAlbums.length;

    const embed = this.newEmbed()
      .setTitle(`Top ${artist.name} albums for ${username}`)
      .setURL(LinkGenerator.libraryArtistTopAlbums(username, artist.name));

    const simpleScrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: topAlbums,
        pageSize: 15,
        pageRenderer(albums) {
          return albums
            .map(
              (album) =>
                `${displayNumber(
                  album.playcount,
                  "play"
                )} - ${album.album.name.strong()}`
            )
            .join("\n");
        },
      },
      {
        itemName: "album",
        embedDescription:
          `${displayNumber(totalScrobbles, "total scrobble")}, ${displayNumber(
            topAlbums.length,
            "total album"
          )}, ${displayNumber(
            average.toFixed(2),
            "average scrobble"
          )} per album`.italic() + "\n",
      }
    );

    simpleScrollingEmbed.send();
  }
}
