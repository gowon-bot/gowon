import {
  MentionedUserHasNoRatingsError,
  NoSharedRatingsError,
  NoUserToCompareRatingsToError,
} from "../../../errors/commands/library";
import { NoRatingsError } from "../../../errors/external/rateYourMusic";
import {
  bold,
  mentionGuildMember,
  sanitizeForDiscord,
} from "../../../helpers/discord";
import { emDash } from "../../../helpers/specialCharacters";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber, displayRating } from "../../../lib/ui/displays";
import { ScrollingListView } from "../../../lib/ui/views/ScrollingListView";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TasteService } from "../../../services/taste/TasteService";
import { RatingPair } from "../../../services/taste/TasteService.types";
import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

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

export class Taste extends RateYourMusicChildCommand<typeof args> {
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
      throw new NoUserToCompareRatingsToError();
    }

    const ratings = await this.lilacRatingsService.ratingsTaste(this.ctx, {
      sender: { discordID: this.author.id },
      mentioned: { discordID: discordUser.id },
    });

    if (!ratings.sender.ratings?.length) {
      throw new NoRatingsError(this.prefix);
    } else if (!ratings.mentioned.ratings?.length) {
      throw new MentionedUserHasNoRatingsError();
    }

    const tasteMatch = this.tasteService.ratingsTaste(
      ratings.sender.ratings,
      ratings.mentioned.ratings,
      this.parsedArguments.strict ? 0 : this.parsedArguments.lenient ? 2 : 1
    );

    if (!tasteMatch.ratings.length) {
      throw new NoSharedRatingsError(discordUser.id);
    }

    const embedDescription = `**Taste comparison for ${mentionGuildMember(
      this.author.id
    )} and ${mentionGuildMember(discordUser.id)}**\n\nComparing ${displayNumber(
      ratings.sender.pagination.totalItems
    )} and ${displayNumber(
      ratings.mentioned.pagination.totalItems,
      "rating"
    )}, ${displayNumber(tasteMatch.ratings.length, "similar rating")}\n_${
      tasteMatch.percent
    }% match found (${this.tasteService.compatibility(tasteMatch.percent)})_`;

    const scrollingEmbed = new ScrollingListView(
      this.ctx,
      this.minimalEmbed(),
      {
        items: tasteMatch.ratings,
        pageSize: 10,
        pageRenderer: (ratings) => {
          return embedDescription + "\n\n" + this.generateTable(ratings);
        },
        overrides: { itemName: "rating" },
      }
    );

    await this.reply(scrollingEmbed);
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
