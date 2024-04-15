import { NoRatingsError } from "../../../errors/external/rateYourMusic";
import { fourPerEmSpace } from "../../../helpers/specialCharacters";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { PaginatedCache } from "../../../lib/paginators/PaginatedCache";
import { displayRating } from "../../../lib/ui/displays";
import { ScrollingView } from "../../../lib/ui/views/ScrollingView";
import { LilacRatingsFilters } from "../../../services/lilac/LilacAPIService.types";
import { MirrorballRating } from "../../../services/mirrorball/MirrorballTypes";
import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

const args = {
  rating: new StringArgument({
    index: 0,
    choices: ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"],
    description: "Filter your ratings by a specific rating",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export class Ratings extends RateYourMusicChildCommand<typeof args> {
  private readonly pageSize = 15;

  aliases = ["rat"];
  idSeed = "hot issue yewon";
  description =
    "Shows your top rated albums, or albums you've given a specific rating";
  usage = ["", "rating"];

  arguments = args;

  slashCommand = true;

  async run() {
    let rating: number | undefined;

    if (this.parsedArguments.rating) {
      rating = parseFloat(this.parsedArguments.rating) * 2;
    }

    const { dbUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      dbUserRequired: true,
      syncedRequired: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const filters: LilacRatingsFilters = {
      rating,
      user: {
        discordID: dbUser.discordID,
      },
    };

    const initialPages = await this.lilacRatingsService.ratings(this.ctx, {
      ...filters,
      pagination: { perPage: this.pageSize * 3, page: 1 },
    });

    if (!initialPages.pagination.totalItems) {
      throw new NoRatingsError(this.prefix, rating, perspective);
    }

    const paginatedCache = new PaginatedCache(async (page) => {
      const response = await this.lilacRatingsService.ratings(this.ctx, {
        ...filters,
        pagination: { perPage: this.pageSize, page },
      });

      return response.ratings;
    });

    paginatedCache.cacheInitial(initialPages.ratings, this.pageSize);

    const embed = this.minimalEmbed().setTitle(
      rating
        ? `${perspective.upper.possessive} albums rated ${rating / 2}`
        : `${perspective.upper.possessive} top rated albums`
    );

    const scrollingEmbed = new ScrollingView(this.ctx, embed, {
      initialItems: this.generateTable(await paginatedCache.getPage(1)),
      totalPages: Math.ceil(initialPages.pagination.totalItems / this.pageSize),
      totalItems: initialPages.pagination.totalItems,
      itemName: "rating",
    });

    scrollingEmbed.onPageChange(async (page) => {
      return this.generateTable(await paginatedCache.getPage(page));
    });

    await this.reply(scrollingEmbed);
  }

  private generateTable(ratings: MirrorballRating[]): string {
    const startRating = ratings[0].rating;
    let displayedHeader = false;

    return (
      displayRating(startRating) +
      "\n" +
      ratings
        .map((r) => {
          let header = "";

          if (r.rating !== startRating && !displayedHeader) {
            displayedHeader = true;
            header += "\n" + displayRating(r.rating);
          }

          return (
            (header ? header + "\n" : "") +
            `${fourPerEmSpace}${r.rateYourMusicAlbum.artistName} - ${r.rateYourMusicAlbum.title}`
          );
        })
        .join("\n")
    );
  }
}
