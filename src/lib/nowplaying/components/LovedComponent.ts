import { PlaceholderNowPlayingComponent } from "../base/PlaceholderNowPlayingComponent";

const lovedRequirements = ["trackInfo"] as const;

export class LovedComponent extends PlaceholderNowPlayingComponent<
  typeof lovedRequirements
> {
  static componentName = "loved";
  static friendlyName = "Loved";
  readonly requirements = lovedRequirements;
}
