import { UnknownMirrorballError } from "../../../../errors/errors";
import { NoRatingsError } from "../../../../errors/external/rateYourMusic";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { PaginatedCache } from "../../../../lib/paginators/PaginatedCache";
import { displayRating } from "../../../../lib/ui/displays";
import { ScrollingView } from "../../../../lib/ui/views/ScrollingView";
import { MirrorballRating } from "../../../../services/mirrorball/MirrorballTypes";
import { RatingsConnector, RatingsParams, RatingsResponse } from "./connectors";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";

const args = {
  rating: new StringArgument({
    index: 0,
    choices: ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"],
    description: "Filter your ratings by a specific rating",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export class Ratings extends RateYourMusicIndexingChildCommand<
  RatingsResponse,
  RatingsParams,
  typeof args
> {
  private readonly pageSize = 15;

  connector = new RatingsConnector();

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
      indexedRequired: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const initialPages = await this.query({
      rating,
      user: {
        lastFMUsername: dbUser.lastFMUsername,
        discordID: dbUser.discordID,
      },
      pageInput: { limit: this.pageSize * 3, offset: 0 },
    });

    const errors = this.parseErrors(initialPages);

    if (errors) {
      throw new UnknownMirrorballError();
    }

    if (!initialPages.ratings.pageInfo.recordCount) {
      throw new NoRatingsError(this.prefix, rating, perspective);
    }

    const paginatedCache = new PaginatedCache(async (page) => {
      const response = await this.query({
        user: {
          lastFMUsername: dbUser.lastFMUsername,
          discordID: dbUser.discordID,
        },
        rating,
        pageInput: { limit: this.pageSize, offset: this.pageSize * (page - 1) },
      });

      return response.ratings.ratings;
    });

    paginatedCache.cacheInitial(initialPages.ratings.ratings, this.pageSize);

    const embed = this.authorEmbed()
      .setHeader("RateYourMusic ratings")
      .setTitle(
        rating
          ? `${perspective.upper.possessive} albums rated ${rating / 2}`
          : `${perspective.upper.possessive} top rated albums`
      );

    const scrollingEmbed = new ScrollingView(this.ctx, embed, {
      initialItems: this.generateTable(await paginatedCache.getPage(1)),
      totalPages: Math.ceil(
        initialPages.ratings.pageInfo.recordCount / this.pageSize
      ),
      totalItems: initialPages.ratings.pageInfo.recordCount,
      itemName: "rating",
    });

    scrollingEmbed.onPageChange(async (page) => {
      return this.generateTable(await paginatedCache.getPage(page));
    });

    await this.send(scrollingEmbed);
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
            // this is a special space to make things align better
            ` ${r.rateYourMusicAlbum.artistName} - ${r.rateYourMusicAlbum.title}`
          );
        })
        .join("\n")
    );
  }
}
