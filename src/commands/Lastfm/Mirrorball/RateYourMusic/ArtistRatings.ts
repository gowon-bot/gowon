import { LogicError, UnknownIndexerError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import {
  ArtistRatingsConnector,
  ArtistRatingsParams,
  ArtistRatingsResponse,
} from "./connectors";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";
import { MirrorballRating } from "../../../../services/indexing/IndexingTypes";
import { mean } from "mathjs";
import { mostCommonOccurrence } from "../../../../helpers/stats";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { displayNumber, displayRating } from "../../../../lib/views/displays";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
} as const;

export class ArtistRatings extends RateYourMusicIndexingChildCommand<
  ArtistRatingsResponse,
  ArtistRatingsParams,
  typeof args
> {
  connector = new ArtistRatingsConnector();

  aliases = ["ara"];
  idSeed = "sonamoo sumin";
  description = "Shows your top rated albums from an artist";

  rollout = {
    guilds: this.mirrorballGuilds,
  };

  arguments: Arguments = args;

  async run() {
    let { senderRequestable, dbUser, senderUser, discordUser } =
      await this.parseMentions({
        senderRequired: !this.parsedArguments.artist,
        fetchDiscordUser: true,
      });

    const artist = await this.lastFMArguments.getArtist(senderRequestable);

    const user = (dbUser || senderUser)!;

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const response = await this.query({
      user: { lastFMUsername: user.lastFMUsername, discordID: user.discordID },
      artist: { name: artist },
      artistKeywords: artist,
    });

    const errors = this.parseErrors(response);

    let artistName =
      response.artist?.artistName ||
      this.getArtistName(response.ratings.ratings) ||
      artist;

    if (errors) {
      throw new UnknownIndexerError();
    }

    if (!response.ratings.ratings.length) {
      throw new LogicError(
        `Couldn't find any albums by that artist in ${perspective.possessive} ratings!`
      );
    }

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
      (mean(response.ratings.ratings.map((r) => r.rating)) as number) / 2
    ).toPrecision(2)}/5 from ${displayNumber(
      response.ratings.ratings.length,
      "rating"
    )}`;

    const simpleScrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: response.ratings.ratings,
        pageSize: 10,
        pageRenderer: (items) =>
          header + "\n\n" + this.generateTable(items, artistName!),
      },
      { itemName: "rating" }
    );

    simpleScrollingEmbed.send();
  }

  private generateTable(
    ratings: MirrorballRating[],
    artistName: string
  ): string {
    return ratings
      .map((r, idx) => {
        return (
          displayRating(ratings[idx].rating) +
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

  private getArtistName(ratings: MirrorballRating[]): string {
    return mostCommonOccurrence(
      ratings.map((r) => r.rateYourMusicAlbum.artistName)
    )!;
  }
}
