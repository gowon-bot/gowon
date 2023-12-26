import { displayPlainRating } from "../../ui/displays";
import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

const ratingDependencies = ["albumRating"] as const;

export class RatingComponent extends BaseNowPlayingComponent<
  typeof ratingDependencies
> {
  static componentName = "album-rating";
  static friendlyName = "Album rating";
  readonly dependencies = ratingDependencies;

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
