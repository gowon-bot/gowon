import { MirrorballError, LogicError } from "../../../../errors/errors";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  ArtistTopAlbumsConnector,
  ArtistTopAlbumsParams,
  ArtistTopAlbumsResponse,
} from "./ArtistTopAlbums.connector";
import { displayNumber } from "../../../../lib/views/displays";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import {
  prefabArguments,
  prefabFlags,
} from "../../../../lib/context/arguments/prefabArguments";
import { bold, italic } from "../../../../helpers/discord";
import { Emoji } from "../../../../lib/Emoji";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";

const args = {
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class ArtistTopAlbums extends MirrorballBaseCommand<
  ArtistTopAlbumsResponse,
  ArtistTopAlbumsParams,
  typeof args
> {
  connector = new ArtistTopAlbumsConnector();
  idSeed = "redsquare bomin";

  subcategory = "library";
  description = "Displays your top scrobbled albums from an artist";
  aliases = ["atl", "iatl"];

  slashCommand = true;

  arguments = args;

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
      { redirect: !this.parsedArguments.noRedirect }
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
        `${perspective.plusToHave} no scrobbles of any albums from ${bold(
          artist.name
        )}!`
      );
    }

    const totalScrobbles = topAlbums.reduce((sum, l) => sum + l.playcount, 0);
    const average = totalScrobbles / topAlbums.length;

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Artist top albums"))
      .setTitle(
        `${Emoji.usesIndexedDataLink} Top ${artist.name} albums for ${username}`
      )
      .setURL(LinkGenerator.libraryArtistTopAlbums(username, artist.name));

    const simpleScrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: topAlbums,
      pageSize: 15,
      pageRenderer(albums) {
        return albums
          .map(
            (album) =>
              `${displayNumber(album.playcount, "play")} - ${bold(
                album.album.name || "(no album)"
              )}`
          )
          .join("\n");
      },

      overrides: {
        itemName: "album",
        embedDescription:
          italic(
            `${displayNumber(
              totalScrobbles,
              "total scrobble"
            )}, ${displayNumber(
              topAlbums.length,
              "total album"
            )}, ${displayNumber(
              average.toFixed(2),
              "average scrobble"
            )} per album`
          ) + "\n",
      },
    });

    simpleScrollingEmbed.send();
  }
}
