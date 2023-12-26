import { displayNumber } from "../../ui/displays";
import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

const trackPlaysDependencies = ["trackInfo"] as const;

export class TrackPlaysComponent extends BaseNowPlayingComponent<
  typeof trackPlaysDependencies
> {
  static componentName = "track-plays";
  static friendlyName = "Track plays";
  readonly dependencies = trackPlaysDependencies;

  present() {
    if (this.values.trackInfo) {
      return {
        string: displayNumber(
          this.values.trackInfo.userPlaycount,
          "track scrobble"
        ),
        size: 1,
      };
    } else {
      return { string: "", size: 0 };
    }
  }
}
