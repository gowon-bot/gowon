import { MessageEmbed } from "discord.js";
import { IndexerError, LogicError } from "../../../../errors";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { IndexingBaseCommand } from "../../../../lib/indexing/IndexingCommand";
import {
  ArtistTopTracksConnector,
  ArtistTopTracksParams,
  ArtistTopTracksResponse,
} from "./ArtistTopTracks.connector";
import { displayNumber } from "../../../../lib/views/displays";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export default class IndexArtistTopAlbums extends IndexingBaseCommand<
  ArtistTopTracksResponse,
  ArtistTopTracksParams,
  typeof args
> {
  connector = new ArtistTopTracksConnector();

  idSeed = "weeekly soojin";

  aliases = ["att", "at", "iatt", "favs"];

  description = "Displays your top scrobbled tracks from an artist";
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

    const { topTracks, artist } = response.artistTopTracks;

    if (topTracks.length < 1) {
      throw new LogicError(
        `${
          perspective.plusToHave
        } no scrobbles of any songs from ${artist.name.strong()}!`
      );
    }
    const embed = new MessageEmbed()
      .setTitle(`Top ${artist.name} tracks for ${username}`)
      .setURL(LinkGenerator.artistPage(artist.name));

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
