import { abs } from "mathjs";
import { calculatePercent } from "../../helpers/stats";
import { MirrorballRating } from "../../services/mirrorball/MirrorballTypes";

export interface TasteRating {
  userOneRating: MirrorballRating;
  userTwoRating: MirrorballRating;
}

export interface RatingsTaste {
  percent: string;
  ratings: TasteRating[];
}

export class RatingsTasteCalculator {
  constructor(
    private userOneRatings: MirrorballRating[],
    private userTwoRatings: MirrorballRating[],
    private ratingThreshold = 1 // half a star differences will be displayed
  ) {}

  calculate(): RatingsTaste {
    const matchedRatings = this.userOneRatings.reduce((acc, rating) => {
      const userTwoRating = this.userTwoRatings.find(
        (r) =>
          r.rateYourMusicAlbum.rateYourMusicID ===
            rating.rateYourMusicAlbum.rateYourMusicID &&
          abs(rating.rating - r.rating) <= this.ratingThreshold
      );

      if (userTwoRating) {
        acc.push({ userOneRating: rating, userTwoRating });
      }

      return acc;
    }, [] as TasteRating[]);

    return {
      percent: calculatePercent(
        matchedRatings.length,
        this.userOneRatings.length
      ),
      ratings: matchedRatings,
    };
  }
}
