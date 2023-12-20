import { mean } from "mathjs";
import { LogicError, UnknownMirrorballError } from "../../../../errors/errors";
import { toInt } from "../../../../helpers/lastfm/";
import { extraWideSpace } from "../../../../helpers/specialCharacters";
import { standardMentions } from "../../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { displayNumber, displayRating } from "../../../../lib/ui/displays";
import { MirrorballRateYourMusicAlbum } from "../../../../services/mirrorball/MirrorballTypes";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";
import { StatsConnector, StatsParams, StatsResponse } from "./connectors";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

interface Curve {
  [rating: number]: number;
}

export class Stats extends RateYourMusicIndexingChildCommand<
  StatsResponse,
  StatsParams,
  typeof args
> {
  connector = new StatsConnector();

  idSeed = "shasha hakyung";
  description = "Shows what you've rated an artists albums";

  arguments = args;

  slashCommand = true;

  async run() {
    const { dbUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
      indexedRequired: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const response = await this.query({
      user: { discordID: dbUser.discordID },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new UnknownMirrorballError();
    }

    if (!response.ratings.ratings.length) {
      throw new LogicError(
        `You don't have any ratings imported yet! To import your ratings see \`${this.prefix}ryms help\``
      );
    }

    const ratingsCounts = this.getRatingsCounts(response.ratings.ratings);

    const embed = this.authorEmbed()
      .setHeader("RateYourMusic stats")
      .setTitle(`${perspective.upper.possessive} RateYourMusic statistics`)
      .setDescription(
        `_${displayNumber(
          response.ratings.ratings.length,

          "total rating"
        )}, Average rating: ${displayNumber(
          (mean(response.ratings.ratings.map((r) => r.rating)) / 2).toFixed(3)
        )}_
        
${Object.entries(ratingsCounts)
  .sort((a, b) => toInt(b) - toInt(a))
  .map(
    ([rating, count]) =>
      `${displayRating(toInt(rating))}${extraWideSpace}${displayNumber(count)}`
  )
  .join("\n")}`
      );

    await this.send(embed);
  }

  private getRatingsCounts(
    ratings: {
      rating: number;
      rateYourMusicAlbum: MirrorballRateYourMusicAlbum;
    }[]
  ): Curve {
    const curve = {} as Curve;

    for (const rating of ratings) {
      curve[rating.rating] = ~~curve[rating.rating] + 1;
    }

    return curve;
  }
}
