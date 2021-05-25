import { MessageEmbed } from "discord.js";
import { IndexerError } from "../../../../errors";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { Variation } from "../../../../lib/command/BaseCommand";
import { IndexingBaseCommand } from "../../../../lib/indexing/IndexingCommand";
import { displayLink, displayNumber } from "../../../../lib/views/displays";
import {
  WhoKnowsAlbumConnector,
  WhoKnowsAlbumParams,
  WhoKnowsAlbumResponse,
} from "./WhoKnowsAlbum.connector";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
} as const;

export default class WhoKnowsAlbum extends IndexingBaseCommand<
  WhoKnowsAlbumResponse,
  WhoKnowsAlbumParams,
  typeof args
> {
  connector = new WhoKnowsAlbumConnector();

  idSeed = "redsquare green";

  aliases = ["wkl"];

  variations: Variation[] = [{ name: "update", variation: "uwkl" }];

  subcategory = "whoknows";
  description = "See who knows an album";

  rollout = {
    guilds: this.indexerGuilds,
  };

  arguments: Arguments = args;

  async run() {
    let artistName = this.parsedArguments.artist,
      albumName = this.parsedArguments.album;

    let { senderUsername } = await this.parseMentions({
      senderRequired: !artistName || !albumName,
    });

    if (!artistName || !albumName) {
      let nowPlaying = await this.lastFMService.nowPlaying(senderUsername);

      if (!artistName) artistName = nowPlaying.artist;
      if (!albumName) albumName = nowPlaying.album;
    } else {
      const lfmAlbum = await this.lastFMService.albumInfo({
        artist: artistName,
        album: albumName,
      });

      artistName = lfmAlbum.artist;
      albumName = lfmAlbum.name;
    }

    if (this.variationWasUsed("update")) {
      await this.updateAndWait(senderUsername);
    }

    const response = await this.query({
      album: { name: albumName, artist: { name: artistName } },
      settings: { guildID: this.guild.id, limit: 20 },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError(errors.errors[0].message);
    }

    const { rows, album } = response.whoKnowsAlbum;

    const embed = new MessageEmbed()
      .setTitle(
        `Who knows ${album.name.italic()} by ${album.artist.name.strong()}?`
      )
      .setDescription(
        !album || rows.length === 0
          ? `No one knows this album`
          : rows.map(
              (wk, index) =>
                `${index + 1}. ${displayLink(
                  wk.user.username,
                  LinkGenerator.userPage(wk.user.username)
                )} - **${displayNumber(wk.playcount, "**play")}`
            )
      );

    await this.send(embed);
  }
}
