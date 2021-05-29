import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const lovedRequirements = ["trackInfo"] as const;

export class LovedComponent extends BaseNowPlayingComponent<
  typeof lovedRequirements
> {
  static componentName = "loved";
  readonly requirements = lovedRequirements;

  present() {
    if (this.values.trackInfo && this.values.trackInfo.loved) {
      return {
        string: "❤️",
        size: 0,
      };
    } else {
      return {
        string: "",
        size: 0,
      };
    }
  }
}
