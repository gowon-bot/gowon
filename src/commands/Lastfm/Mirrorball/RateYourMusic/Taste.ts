import {
  RatingsTasteResponse,
  RatingsTasteParams,
  RatingsTasteConnector,
} from "./connectors";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";
import { LogicError, NoRatingsError } from "../../../../errors";
import {
  RatingsTasteCalculator,
  TasteRating,
} from "../../../../lib/calculators/RatingsTasteCalculator";
import { displayNumber, displayRating } from "../../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { sanitizeForDiscord } from "../../../../helpers/discord";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { Flag } from "../../../../lib/context/arguments/argumentTypes/Flag";

const args = {
  ...standardMentions,

  lenient: new Flag({
    description:
      "Show ratings that are 1 star apart, instead of the default 0.5",
    longnames: ["lenient"],
    shortnames: ["l"],
  }),
  strict: new Flag({
    description: "Only show ratings that are exactly the same",
    longnames: ["strict", "exact"],
    shortnames: ["s", "e"],
  }),
} as const;

export class Taste extends RateYourMusicIndexingChildCommand<
  RatingsTasteResponse,
  RatingsTasteParams,
  typeof args
> {
  connector = new RatingsTasteConnector();

  aliases = ["t", "tasteratings", "ratingstaste"];
  idSeed = "dreamnote sinae";
  description = "Shows the overlap between your ratings and another user's";
  usage = ["@user"];

  arguments = args;

  async run() {
    const { discordUser } = await this.parseMentions({
      fetchDiscordUser: true,
    });

    if (!discordUser || discordUser?.id === this.author.id) {
      throw new LogicError(
        "Please mention a user to compare your ratings with!"
      );
    }

    const ratings = await this.query({
      mentioned: { discordID: discordUser.id },
      sender: { discordID: this.author.id },
    });

    if (!ratings.sender.ratings?.length) {
      throw new NoRatingsError(this.prefix);
    } else if (!ratings.mentioned.ratings?.length) {
      throw new LogicError("The user you mentioned doesn't have any ratings!");
    }

    const tasteCalculator = new RatingsTasteCalculator(
      ratings.sender.ratings,
      ratings.mentioned.ratings,
      this.parsedArguments.strict ? 0 : this.parsedArguments.lenient ? 2 : 1
    );

    const taste = tasteCalculator.calculate();

    if (!taste.ratings.length) {
      throw new LogicError(
        `You and ${discordUser?.tag} share no common ratings! (try using the --lenient flag to allow for larger differences)`
      );
    }

    const embedDescription = `Comparing ${displayNumber(
      ratings.sender.pageInfo.recordCount
    )} and ${displayNumber(
      ratings.mentioned.pageInfo.recordCount,
      "rating"
    )}, ${displayNumber(taste.ratings.length, "similar rating")} (${
      taste.percent
    }% match) found.`;

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Ratings taste comparison"))
      .setTitle(
        `Taste comparison for ${this.author.tag} and ${discordUser?.tag}`
      );

    const scrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: taste.ratings,
        pageSize: 10,
        pageRenderer: (ratings) => {
          return (
            embedDescription.italic() + "\n\n" + this.generateTable(ratings)
          );
        },
      },
      { itemName: "rating" }
    );

    scrollingEmbed.send();
  }

  private generateTable(ratings: TasteRating[]): string {
    return ratings
      .map(
        (r) =>
          `${displayRating(r.userOneRating.rating)} • ${displayRating(
            r.userTwoRating.rating
          )} — ${r.userOneRating.rateYourMusicAlbum.title.strong()} (${sanitizeForDiscord(
            r.userOneRating.rateYourMusicAlbum.artistName
          )})`
      )
      .join("\n");
  }
}
