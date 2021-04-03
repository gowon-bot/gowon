import { MessageEmbed } from "discord.js";
import { IndexerError, LogicError } from "../../../../errors";
import { numberDisplay } from "../../../../helpers";
import { SimpleScrollingEmbed } from "../../../../helpers/Embeds/SimpleScrollingEmbed";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { IndexingCommand } from "../../../../lib/indexing/IndexingCommand";
import {
  ArtistTopTracksConnector,
  ArtistTopTracksParams,
  ArtistTopTracksResponse,
} from "./ArtistTopTracks.connector";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export default class IndexArtistTopAlbums extends IndexingCommand<
  ArtistTopTracksResponse,
  ArtistTopTracksParams,
  typeof args
> {
  connector = new ArtistTopTracksConnector();

  idSeed = "weeekly soojin";

  aliases = ["iatt"];

  description = "Displays your top scrobbled tracks from an artist";
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

    const { topTracks, artist } = response.artistTopTracks;

    if (topTracks.length < 1) {
      throw new LogicError(
        "you don't have any scrobbles of any songs from this artist!"
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
                `${numberDisplay(
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
