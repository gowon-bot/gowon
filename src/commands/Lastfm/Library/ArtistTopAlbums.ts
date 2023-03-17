import { LogicError } from "../../../errors/errors";
import { bold, italic } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import {
  prefabArguments,
  prefabFlags,
} from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/Emoji";
import { LilacBaseCommand } from "../../../lib/Lilac/LilacBaseCommand";
import { displayNumber } from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { LilacLibraryService } from "../../../services/lilac/LilacLibraryService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";

const args = {
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class ArtistTopAlbums extends LilacBaseCommand<typeof args> {
  idSeed = "redsquare bomin";

  subcategory = "library";
  description = "Displays your top scrobbled albums from an artist";
  aliases = ["atl", "aab"];

  slashCommand = true;

  arguments = args;

  lilacLibraryService = ServiceRegistry.get(LilacLibraryService);

  async run() {
    const { username, dbUser, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
        reverseLookup: { required: true },
        indexedRequired: true,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: !this.parsedArguments.noRedirect }
    );

    const response = await this.lilacLibraryService.artistTopAlbums(
      this.ctx,
      {
        album: { artist: { name: artistName } },
        users: [{ discordID: dbUser.discordID }],
      },
      {
        inputs: [{ name: artistName }],
        pagination: { perPage: 1, page: 1 },
      }
    );

    const artist = response.artists.artists[0];
    const topAlbums = response.albumCounts.albumCounts;

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
      .setURL(LastfmLinks.libraryArtistTopAlbums(username, artist.name));

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
