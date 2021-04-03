import { MessageEmbed } from "discord.js";
import { IndexerError, LogicError } from "../../../../errors";
import { numberDisplay } from "../../../../helpers";
import { SimpleScrollingEmbed } from "../../../../helpers/Embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { IndexingCommand } from "../../../../lib/indexing/IndexingCommand";
import {
  ArtistTopAlbumsConnector,
  ArtistTopAlbumsParams,
  ArtistTopAlbumsResponse,
} from "./ArtistTopAlbums.connector";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export default class IndexArtistTopAlbums extends IndexingCommand<
  ArtistTopAlbumsResponse,
  ArtistTopAlbumsParams,
  typeof args
> {
  connector = new ArtistTopAlbumsConnector();

  idSeed = "redsquare bomin";

  aliases = ["iatl"];

  description = "Displays your top scrobbled albums from an artist";
  secretCommand = true;

  rollout = {
    guilds: ["768596255697272862"],
  };

  arguments: Arguments = args;

  async run() {
    let artistName = this.parsedArguments.artist;

    let { username } = await this.parseMentions({
      senderRequired: !artistName,
    });

    if (!artistName) {
      artistName = (await this.lastFMService.nowPlayingParsed(username)).artist;
    } else {
      const lfmArtist = await this.lastFMService.artistInfo({
        artist: artistName,
      });

      artistName = lfmArtist.name;
    }

    const response = await this.query({
      artist: { name: artistName },
      user: { discordID: this.author.id },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError(errors.errors[0].message);
    }

    const { topAlbums, artist } = response.artistTopAlbums;

    if (topAlbums.length < 1) {
      throw new LogicError(
        "you don't have any scrobbles of any albums from this artist!"
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
