import { displayNumber } from "../../views/displays";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const listenersRequirements = ["artistInfo"] as const;

export class ListenersComponent extends BaseNowPlayingComponent<
  typeof listenersRequirements
> {
  static componentName = "listeners";
  readonly requirements = listenersRequirements;

  present() {
    return {
      string: `${displayNumber(
        this.values.artistInfo?.listeners || 0,
        `Last.fm listener`
      )}`,
      size: 1,
    };
  }
}
