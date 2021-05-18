import { numberDisplay } from "../../../helpers";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const trackPlaysRequirements = ["trackInfo"] as const;

export class TrackPlaysComponent extends BaseNowPlayingComponent<
  typeof trackPlaysRequirements
> {
  static componentName = "track-plays";
  readonly requirements = trackPlaysRequirements;

  present() {
    if (this.values.trackInfo) {
      return {
        string: `${numberDisplay(
          this.values.trackInfo.userplaycount,
          "scrobble"
        )} of this song`,
        size: 1,
      };
    } else {
      return { string: "", size: 0 };
    }
  }
}
