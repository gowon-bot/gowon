import { PlaceholderNowPlayingComponent } from "../base/PlaceholderNowPlayingComponent";

const lovedDependencies = ["trackInfo"] as const;

export class LovedComponent extends PlaceholderNowPlayingComponent<
  typeof lovedDependencies
> {
  static componentName = "loved";
  static friendlyName = "Loved";
  readonly dependencies = lovedDependencies;
}
