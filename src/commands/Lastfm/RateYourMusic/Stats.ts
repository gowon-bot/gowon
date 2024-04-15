import { mean } from "mathjs";
import { NoImportedRatingsFound } from "../../../errors/commands/library";
import { toInt } from "../../../helpers/lastfm";
import { extraWideSpace } from "../../../helpers/specialCharacters";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber, displayRating } from "../../../lib/ui/displays";
import { LilacRating } from "../../../services/lilac/LilacAPIService.types";
import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

interface Curve {
  [rating: number]: number;
}

export class Stats extends RateYourMusicChildCommand<typeof args> {
  idSeed = "shasha hakyung";
  description = "Shows your RateYourMusic statistics";

  arguments = args;

  slashCommand = true;

  async run() {
    const { dbUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
      syncedRequired: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const ratings = await this.lilacRatingsService.ratings(this.ctx, {
      user: { discordID: dbUser.discordID },
    });

    if (!ratings.ratings.length) {
      throw new NoImportedRatingsFound(this.prefix);
    }

    const ratingsCounts = this.getRatingsCounts(ratings.ratings);

    const embed = this.minimalEmbed()
      .setTitle(`${perspective.upper.possessive} RateYourMusic statistics`)
      .setDescription(
        `_${displayNumber(
          ratings.ratings.length,

          "total rating"
        )}, Average rating: ${displayNumber(
          (mean(ratings.ratings.map((r) => r.rating)) / 2).toFixed(3)
        )}_
        
${Object.entries(ratingsCounts)
  .sort((a, b) => toInt(b) - toInt(a))
  .map(
    ([rating, count]) =>
      `${displayRating(toInt(rating))}${extraWideSpace}${displayNumber(count)}`
  )
  .join("\n")}`
      );

    await this.reply(embed);
  }

  private getRatingsCounts(ratings: LilacRating[]): Curve {
    const curve = {} as Curve;

    for (const rating of ratings) {
      curve[rating.rating] = ~~curve[rating.rating] + 1;
    }

    return curve;
  }
}
