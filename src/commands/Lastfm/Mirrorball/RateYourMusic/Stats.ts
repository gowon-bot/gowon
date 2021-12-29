import { mean } from "mathjs";
import { LogicError, UnknownMirrorballError } from "../../../../errors";
import { toInt } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { standardMentions } from "../../../../lib/arguments/mentions/mentions";
import { displayNumber, displayRating } from "../../../../lib/views/displays";
import { MirrorballRateYourMusicAlbum } from "../../../../services/mirrorball/MirrorballTypes";
import { StatsConnector, StatsParams, StatsResponse } from "./connectors";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";

const args = {
  mentions: standardMentions,
} as const;

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

  arguments: Arguments = args;

  async run() {
    const { dbUser, discordUser } = await this.getMentions({
      fetchDiscordUser: true,
      reverseLookup: { required: true },
      requireIndexed: true,
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

    const embed = this.newEmbed()
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
      `${displayRating(toInt(rating))} ${displayNumber(count)}`
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
