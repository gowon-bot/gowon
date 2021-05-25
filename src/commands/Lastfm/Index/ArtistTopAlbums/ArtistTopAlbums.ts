import { MessageEmbed } from "discord.js";
import { IndexerError, LogicError } from "../../../../errors";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { IndexingBaseCommand } from "../../../../lib/indexing/IndexingCommand";
import {
  ArtistTopAlbumsConnector,
  ArtistTopAlbumsParams,
  ArtistTopAlbumsResponse,
} from "./ArtistTopAlbums.connector";
import { displayNumber } from "../../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class ArtistTopAlbums extends IndexingBaseCommand<
  ArtistTopAlbumsResponse,
  ArtistTopAlbumsParams,
  typeof args
> {
  connector = new ArtistTopAlbumsConnector();

  subcategory = "library";
  idSeed = "redsquare bomin";

  aliases = ["atl", "iatl"];

  description = "Displays your top scrobbled albums from an artist";

  rollout = {
    guilds: this.indexerGuilds,
  };

  arguments: Arguments = args;

  async run() {
    let artistName = this.parsedArguments.artist;

    let { username, senderUser, senderUsername, dbUser, perspective } =
      await this.parseMentions({
        senderRequired: !artistName,
        reverseLookup: { lastFM: true },
      });

    const user = (dbUser || senderUser)!;

    await this.throwIfNotIndexed(user, perspective);

    if (!artistName) {
      artistName = (await this.lastFMService.nowPlaying(senderUsername)).artist;
    } else {
      const lfmArtist = await this.lastFMService.artistInfo({
        artist: artistName,
      });

      artistName = lfmArtist.name;
    }

    const response = await this.query({
      artist: { name: artistName },
      user: { discordID: user.discordID },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError(errors.errors[0].message);
    }

    const { topAlbums, artist } = response.artistTopAlbums;

    if (topAlbums.length < 1) {
      throw new LogicError(
        `${
          perspective.plusToHave
        } no scrobbles of any albums from ${artist.name.strong()}!`
      );
    }

    const embed = new MessageEmbed()
      .setTitle(`Top ${artist.name} albums for ${username}`)
      .setURL(LinkGenerator.artistPage(artist.name));

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
      { itemName: "album" }
    );

    simpleScrollingEmbed.send();
  }
}
