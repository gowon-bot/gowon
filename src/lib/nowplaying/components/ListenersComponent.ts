import { displayNumber } from "../../ui/displays";
import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

const listenersRequirements = ["artistInfo"] as const;

export class ListenersComponent extends BaseNowPlayingComponent<
  typeof listenersRequirements
> {
  static componentName = "listeners";
  static friendlyName = "Last.fm listeners";
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
