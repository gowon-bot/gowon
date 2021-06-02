import { MessageEmbed } from "discord.js";
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
    let artistName = this.parsedArguments.artist,
      albumName = this.parsedArguments.album;

    const { username, senderUser, senderUsername, dbUser, perspective } =
      await this.parseMentions({
        senderRequired: !artistName || !albumName,
        reverseLookup: { lastFM: true },
      });

    const user = (dbUser || senderUser)!;

    await this.throwIfNotIndexed(user, perspective);

    if (!artistName || !albumName) {
      let nowPlaying = await this.lastFMService.nowPlaying(senderUsername);

      if (!artistName) artistName = nowPlaying.artist;
      if (!albumName) albumName = nowPlaying.album;
    }

    if (!artistName) {
      artistName = (await this.lastFMService.nowPlaying(senderUsername)).artist;
    } else {
      const lfmArtist = await this.lastFMService.artistInfo({
        artist: artistName,
      });

      artistName = lfmArtist.name;
    }

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
    const embed = new MessageEmbed()
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
