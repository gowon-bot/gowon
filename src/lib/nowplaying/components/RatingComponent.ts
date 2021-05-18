import { ratingDisplay } from "../../../helpers";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const ratingRequirements = ["albumRating"] as const;

export class RatingComponent extends BaseNowPlayingComponent<
  typeof ratingRequirements
> {
  static componentName = "album-rating";
  readonly requirements = ratingRequirements;

  present() {
    const albumRating = this.values.albumRating[0];

    if (albumRating) {
      return {
        string: ratingDisplay(albumRating.rating),
        size: 1,
      };
    }

    return { string: "", size: 0 };
  }
}
