import { PlaceholderNowPlayingComponent } from "../base/PlaceholderNowPlayingComponent";

const cardOwnershipDependencies = ["albumCard"] as const;

export class CardOwnershipComponent extends PlaceholderNowPlayingComponent<
  typeof cardOwnershipDependencies
> {
  static componentName = "card-ownership";
  static friendlyName = "Card ownership";
  static secret = true;
  readonly dependencies = cardOwnershipDependencies;
}
