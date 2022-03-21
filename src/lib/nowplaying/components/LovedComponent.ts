import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const lovedRequirements = ["trackInfo"] as const;

export class LovedComponent extends BaseNowPlayingComponent<
  typeof lovedRequirements
> {
  static componentName = "loved";
  static friendlyName = "Loved";
  readonly requirements = lovedRequirements;

  present() {
    return { size: 0, string: "" };
  }
}
