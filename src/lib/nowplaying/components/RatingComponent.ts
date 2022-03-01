import { displayPlainRating } from "../../views/displays";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const ratingRequirements = ["albumRating"] as const;

export class RatingComponent extends BaseNowPlayingComponent<
  typeof ratingRequirements
> {
  static componentName = "album-rating";
  static friendlyName = "Album rating";
  readonly requirements = ratingRequirements;

  present() {
    const albumRating = this.values.albumRating.ratings[0];

    if (albumRating) {
      return {
        string: displayPlainRating(albumRating.rating),
        size: 1,
      };
    }

    return { string: "", size: 0 };
  }
}
