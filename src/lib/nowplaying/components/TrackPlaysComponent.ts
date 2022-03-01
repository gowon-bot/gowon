import { displayNumber } from "../../views/displays";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const trackPlaysRequirements = ["trackInfo"] as const;

export class TrackPlaysComponent extends BaseNowPlayingComponent<
  typeof trackPlaysRequirements
> {
  static componentName = "track-plays";
  static friendlyName = "Track plays";
  readonly requirements = trackPlaysRequirements;

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
