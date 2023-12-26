import { displayNumber } from "../../ui/displays";
import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

const listenersDependencies = ["artistInfo"] as const;

export class ListenersComponent extends BaseNowPlayingComponent<
  typeof listenersDependencies
> {
  static componentName = "listeners";
  static friendlyName = "Last.fm listeners";
  readonly dependencies = listenersDependencies;

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
