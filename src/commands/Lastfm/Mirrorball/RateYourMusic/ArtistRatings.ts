import { LogicError, UnknownMirrorballError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import {
  ArtistRatingsConnector,
  ArtistRatingsParams,
  ArtistRatingsResponse,
} from "./connectors";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";
import { MirrorballRating } from "../../../../services/mirrorball/MirrorballTypes";
import { mean } from "mathjs";
import { mostCommonOccurrence } from "../../../../helpers/stats";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { displayNumber, displayRating } from "../../../../lib/views/displays";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { sanitizeForDiscord } from "../../../../helpers/discord";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  mentions: standardMentions,
  flags: {
    yearly: {
      description: "Shows your ratings by year",
      shortnames: ["y"],
      longnames: ["year", "yearly"],
    },
    ids: {
      description: "Show IDs instead of ratings (for moderation)",
      shortnames: ["ids", "i"],
      longnames: ["ids"],
    },
  },
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

  arguments: Arguments = args;

  async run() {
    const { senderRequestable, dbUser, discordUser } = await this.parseMentions(
      {
        senderRequired: !this.parsedArguments.artist,
        fetchDiscordUser: true,
        requireIndexed: true,
      }
    );

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const response = await this.query({
      user: {
        lastFMUsername: dbUser.lastFMUsername,
        discordID: dbUser.discordID,
      },
      artist: { name: artist },
      artistKeywords: artist,
    });

    const errors = this.parseErrors(response);

    const artistName =
      response.artist?.artistName ||
      this.getArtistName(response.ratings.ratings) ||
      artist;

    if (errors) {
      throw new UnknownMirrorballError();
    }

    if (!response.ratings.ratings.length) {
      throw new LogicError(
        `Couldn't find any albums by that artist in ${perspective.possessive} ratings!`
      );
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Artist ratings"))
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
    ).toFixed(2)}/5 from ${displayNumber(
      response.ratings.ratings.length,
      "rating"
    )}`;

    const ratings = this.parsedArguments.yearly
      ? response.ratings.ratings.sort(
          (a, b) =>
            b.rateYourMusicAlbum.releaseYear - a.rateYourMusicAlbum.releaseYear
        )
      : this.parsedArguments.ids
      ? response.ratings.ratings.sort((a, b) =>
          a.rateYourMusicAlbum.title.localeCompare(b.rateYourMusicAlbum.title)
        )
      : response.ratings.ratings;

    const simpleScrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: ratings,
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
          (this.parsedArguments.yearly &&
          r.rateYourMusicAlbum.releaseYear !==
            ratings[idx - 1]?.rateYourMusicAlbum?.releaseYear
            ? `**${r.rateYourMusicAlbum.releaseYear}**\n`
            : "") +
          (this.parsedArguments.ids
            ? `[Album${r.rateYourMusicAlbum.rateYourMusicID}]`.code() + " "
            : displayRating(r.rating) +
              // this is a special space
              " ") +
          sanitizeForDiscord(r.rateYourMusicAlbum.title) +
          (r.rateYourMusicAlbum.artistName.toLowerCase() !==
          artistName.toLowerCase()
            ? ` — ${sanitizeForDiscord(
                r.rateYourMusicAlbum.artistName
              )}`.italic()
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
