import { LogicError } from "../../../../errors/errors";
import { NoRatingsError } from "../../../../errors/external/rateYourMusic";
import { bold, italic, sanitizeForDiscord } from "../../../../helpers/discord";
import { emDash } from "../../../../helpers/specialCharacters";
import { Flag } from "../../../../lib/context/arguments/argumentTypes/Flag";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import {
  displayNumber,
  displayRating,
  displayUserTag,
} from "../../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../../lib/views/embeds/SimpleScrollingEmbed";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { TasteService } from "../../../../services/taste/TasteService";
import { RatingPair } from "../../../../services/taste/TasteService.types";
import {
  RatingsTasteConnector,
  RatingsTasteParams,
  RatingsTasteResponse,
} from "./connectors";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";

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
} satisfies ArgumentsMap;

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

  slashCommand = true;

  tasteService = ServiceRegistry.get(TasteService);

  async run() {
    const { discordUser } = await this.getMentions({
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

    const tasteMatch = this.tasteService.ratingsTaste(
      ratings.sender.ratings,
      ratings.mentioned.ratings,
      this.parsedArguments.strict ? 0 : this.parsedArguments.lenient ? 2 : 1
    );

    if (!tasteMatch.ratings.length) {
      throw new LogicError(
        `You and ${displayUserTag(
          discordUser
        )} share no common ratings! (try using the --lenient flag to allow for larger differences)`
      );
    }

    const embedDescription = `Comparing ${displayNumber(
      ratings.sender.pageInfo.recordCount
    )} and ${displayNumber(
      ratings.mentioned.pageInfo.recordCount,
      "rating"
    )}, ${displayNumber(tasteMatch.ratings.length, "similar rating")}\n_${
      tasteMatch.percent
    }% match found (${this.tasteService.compatibility(tasteMatch.percent)})_`;

    const embed = this.authorEmbed()
      .setHeader("Ratings taste")
      .setTitle(
        `Taste comparison for ${displayUserTag(
          this.author
        )} and ${displayUserTag(discordUser)}`
      );

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: tasteMatch.ratings,
      pageSize: 10,
      pageRenderer: (ratings) => {
        return italic(embedDescription) + "\n\n" + this.generateTable(ratings);
      },
      overrides: { itemName: "rating" },
    });

    await this.send(scrollingEmbed);
  }

  private generateTable(ratings: RatingPair[]): string {
    return ratings
      .map(
        (r) =>
          `${displayRating(r.userOneRating.rating)} • ${displayRating(
            r.userTwoRating.rating
          )} ${emDash} ${bold(
            r.userOneRating.rateYourMusicAlbum.title
          )} (${sanitizeForDiscord(
            r.userOneRating.rateYourMusicAlbum.artistName
          )})`
      )
      .join("\n");
  }
}
