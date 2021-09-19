import { Arguments } from "../../../../lib/arguments/arguments";
import { RatingsParams, RatingsResponse, RatingsConnector } from "./connectors";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { PaginatedCache } from "../../../../lib/paginators/PaginatedCache";
import { LogicError, UnknownMirrorballError } from "../../../../errors";
import { MirrorballRating } from "../../../../services/mirrorball/MirrorballTypes";
import { displayRating } from "../../../../lib/views/displays";
import { ScrollingEmbed } from "../../../../lib/views/embeds/ScrollingEmbed";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";

const args = {
  inputs: {
    rating: { index: 0 },
  },
  mentions: standardMentions,
} as const;

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

  validation: Validation = {
    rating: new validators.Choices({
      choices: ["0.5", "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5"],
    }),
  };

  arguments: Arguments = args;

  async run() {
    let rating: number | undefined;

    if (this.parsedArguments.rating) {
      rating = parseFloat(this.parsedArguments.rating) * 2;
    }

    const { dbUser, discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
      requireIndexed: true,
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
      throw new LogicError(
        rating
          ? `Couldn't find any albums rated ${perspective.plusToHave} rated ${rating}`
          : `Couldn't find any ratings! See \`${this.prefix}ryms help\` for help on how to import`
      );
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

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Ratings"))
      .setTitle(
        rating
          ? `${perspective.upper.possessive} albums rated ${rating / 2}`
          : `${perspective.upper.possessive} top rated albums`
      );

    const scrollingEmbed = new ScrollingEmbed(this.message, embed, {
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

    scrollingEmbed.send();
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
