import { MessageEmbed } from "discord.js";
import { IndexerError, LogicError } from "../../../../errors";
import { numberDisplay } from "../../../../helpers";
import { SimpleScrollingEmbed } from "../../../../helpers/Embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { IndexingBaseCommand } from "../../../../lib/indexing/IndexingCommand";
import {
  ArtistTopAlbumsConnector,
  ArtistTopAlbumsParams,
  ArtistTopAlbumsResponse,
} from "./ArtistTopAlbums.connector";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class IndexArtistTopAlbums extends IndexingBaseCommand<
  ArtistTopAlbumsResponse,
  ArtistTopAlbumsParams,
  typeof args
> {
  connector = new ArtistTopAlbumsConnector();

  idSeed = "redsquare bomin";

  aliases = ["atl", "iatl"];

  description = "Displays your top scrobbled albums from an artist";
  secretCommand = true;

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
      artistName = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    } else {
      const lfmArtist = await this.lastFMConverter.artistInfo({
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
                `${numberDisplay(
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
