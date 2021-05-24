import { LogicError, UnknownIndexerError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import {
  ArtistRatingsConnector,
  ArtistRatingsParams,
  ArtistRatingsResponse,
} from "./connectors";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";
import { numberDisplay, ratingDisplayEmojis } from "../../../../helpers";
import { IndexerRateYourMusicAlbum } from "../../../../services/indexing/IndexingTypes";
import { SimpleScrollingEmbed } from "../../../../helpers/Embeds/SimpleScrollingEmbed";
import { mean } from "mathjs";
import { mostCommonOccurrence } from "../../../../helpers/stats";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

type Rating = {
  rating: number;
  rateYourMusicAlbum: IndexerRateYourMusicAlbum;
};

export class ArtistRatings extends RateYourMusicIndexingChildCommand<
  ArtistRatingsResponse,
  ArtistRatingsParams,
  typeof args
> {
  connector = new ArtistRatingsConnector();

  aliases = ["ara"];
  idSeed = "sonamoo sumin";
  description = "Shows what you've rated an artists albums";
  secretCommand = true;

  rollout = {
    guilds: this.indexerGuilds,
  };

  arguments: Arguments = args;

  async run() {
    let artist = this.parsedArguments.artist;

    let { senderUsername, dbUser, senderUser, perspective } =
      await this.parseMentions({
        senderRequired: !artist,
      });

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    const user = (dbUser || senderUser)!;

    const response = await this.query({
      user: { lastFMUsername: user.lastFMUsername, discordID: user.discordID },
      artist: { name: artist },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new UnknownIndexerError();
    }

    if (!response.ratings.length) {
      throw new LogicError(
        "Couldn't find any albums by that artist in your ratings!"
      );
    }

    const artistName = this.getArtistName(response.ratings);

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Artist ratings"))
      .setTitle(
        `${perspective.upper.possessive} top rated ${artistName} albums`
      )
      .setURL(
        `https://www.google.com/search?q=${encodeURIComponent(
          artistName
        )}+site%3Arateyourmusic.com`
      );

    const header = `**Average**: ${(
      (mean(response.ratings.map((r) => r.rating)) as number) / 2
    ).toPrecision(2)}/5 from ${numberDisplay(
      response.ratings.length,
      "rating"
    )}`;

    const simpleScrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: response.ratings,
        pageSize: 10,
        pageRenderer: (items) =>
          header + "\n\n" + this.generateTable(items, artistName),
      },
      { itemName: "rating" }
    );

    simpleScrollingEmbed.send();
  }

  private generateTable(ratings: Rating[], artistName: string): string {
    return ratings
      .map((r, idx) => {
        console.log(r.rateYourMusicAlbum.artistName, artistName);

        return (
          ratingDisplayEmojis(ratings[idx].rating) +
          // this is a special space
          " " +
          r.rateYourMusicAlbum.title +
          (r.rateYourMusicAlbum.artistName !== artistName
            ? ` — ${r.rateYourMusicAlbum.artistName}`.italic()
            : "")
        );
      })
      .join("\n");
  }

  private getArtistName(
    ratings: {
      rating: number;
      rateYourMusicAlbum: IndexerRateYourMusicAlbum;
    }[]
  ): string {
    return mostCommonOccurrence(
      ratings.map((r) => r.rateYourMusicAlbum.artistName)
    )!;
  }
}
