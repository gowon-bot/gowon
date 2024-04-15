import { mean } from "mathjs";
import { NoRatingsFromArtistError } from "../../../errors/commands/library";
import { code, italic, sanitizeForDiscord } from "../../../helpers/discord";
import { emDash, extraWideSpace } from "../../../helpers/specialCharacters";
import { mostCommonOccurrence } from "../../../helpers/stats";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber, displayRating } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { LilacRating } from "../../../services/lilac/LilacAPIService.types";
import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

const args = {
  ...prefabArguments.artist,
  yearly: new Flag({
    description: "Shows your ratings by year",
    shortnames: ["y"],
    longnames: ["year", "yearly"],
  }),
  ids: new Flag({
    description: "Show IDs instead of ratings",
    shortnames: ["ids", "i"],
    longnames: ["ids"],
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export class ArtistRatings extends RateYourMusicChildCommand<typeof args> {
  aliases = ["ara"];
  idSeed = "sonamoo sumin";
  description = "Shows your top rated albums from an artist";

  arguments = args;

  slashCommand = true;

  async run() {
    const { senderRequestable, dbUser, discordUser } = await this.getMentions({
      senderRequired: !this.parsedArguments.artist,
      fetchDiscordUser: true,
      syncedRequired: true,
    });

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const [rymArtist, ratingsPage] = await Promise.all([
      this.lilacRatingsService.getArtist(this.ctx, artist),
      this.lilacRatingsService.ratings(this.ctx, {
        user: { discordID: dbUser.discordID },
        album: { artist: { name: artist } },
      }),
    ]);

    const artistName =
      rymArtist.artistName || this.getArtistName(ratingsPage.ratings) || artist;

    if (!ratingsPage.ratings.length) {
      throw new NoRatingsFromArtistError(perspective);
    }

    const embed = this.minimalEmbed()
      .setTitle(
        `${perspective.upper.possessive} top rated ${artistName} albums`
      )
      .setURL(
        `https://www.google.com/search?q=${encodeURIComponent(
          artistName
        )}+site%3Arateyourmusic.com`
      );

    const header = `**Average**: ${(
      (mean(ratingsPage.ratings.map((r) => r.rating)) as number) / 2
    ).toFixed(2)}/5 from ${displayNumber(
      ratingsPage.ratings.length,
      "rating"
    )}`;

    const ratings = this.parsedArguments.yearly
      ? ratingsPage.ratings.sort(
          (a, b) =>
            b.rateYourMusicAlbum.releaseYear - a.rateYourMusicAlbum.releaseYear
        )
      : this.parsedArguments.ids
      ? ratingsPage.ratings.sort((a, b) =>
          a.rateYourMusicAlbum.title.localeCompare(b.rateYourMusicAlbum.title)
        )
      : ratingsPage.ratings;

    const simpleScrollingEmbed = new ScrollingListView(this.ctx, embed, {
      items: ratings,
      pageSize: 10,
      pageRenderer: (items) =>
        header + "\n\n" + this.generateTable(items, artistName!),
      overrides: { itemName: "rating" },
    });

    await this.reply(simpleScrollingEmbed);
  }

  private generateTable(ratings: LilacRating[], artistName: string): string {
    return ratings
      .map((r, idx) => {
        return (
          (this.parsedArguments.yearly &&
          r.rateYourMusicAlbum.releaseYear !==
            ratings[idx - 1]?.rateYourMusicAlbum?.releaseYear
            ? `**${r.rateYourMusicAlbum.releaseYear}**\n`
            : "") +
          (this.parsedArguments.ids
            ? code(`[Album${r.rateYourMusicAlbum.rateYourMusicID}]`) + " "
            : displayRating(r.rating) + extraWideSpace) +
          sanitizeForDiscord(r.rateYourMusicAlbum.title) +
          (r.rateYourMusicAlbum.artistName.toLowerCase() !==
          artistName.toLowerCase()
            ? italic(
                ` ${emDash} ${sanitizeForDiscord(
                  r.rateYourMusicAlbum.artistName
                )}`
              )
            : "")
        );
      })
      .join("\n");
  }

  private getArtistName(ratings: LilacRating[]): string {
    return mostCommonOccurrence(
      ratings.map((r) => r.rateYourMusicAlbum.artistName)
    )!;
  }
}
