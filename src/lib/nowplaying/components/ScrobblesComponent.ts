import { numberDisplay } from "../../../helpers";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const scrobblesRequirements = [] as const;

export class ScrobblesComponent extends BaseNowPlayingComponent<
  typeof scrobblesRequirements
> {
  static componentName = "scrobbles";
  readonly requirements = scrobblesRequirements;

  present() {
    if (this.values.recentTracks) {
      return {
        string: `${numberDisplay(
          this.values.recentTracks.recenttracks["@attr"].total,
          "total scrobble"
        )}`,
        size: 1,
      };
    } else {
      return {
        string: "",
        size: 0,
      };
    }
  }
}
