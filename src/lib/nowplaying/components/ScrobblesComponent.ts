import { displayNumber } from "../../ui/displays";
import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

const scrobblesRequirements = [] as const;

export class ScrobblesComponent extends BaseNowPlayingComponent<
  typeof scrobblesRequirements
> {
  static componentName = "scrobbles";
  static friendlyName = "Scrobbles";
  readonly requirements = scrobblesRequirements;

  present() {
    if (this.values.recentTracks) {
      return {
        string: `${displayNumber(
          this.values.recentTracks.meta.total,
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
