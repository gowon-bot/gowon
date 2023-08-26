import { PlaceholderNowPlayingComponent } from "../base/PlaceholderNowPlayingComponent";

const cardOwnershipRequirements = ["albumCard"] as const;

export class CardOwnershipComponent extends PlaceholderNowPlayingComponent<
  typeof cardOwnershipRequirements
> {
  static componentName = "card-ownership";
  static friendlyName = "Card ownership";
  static secret = true;
  readonly requirements = cardOwnershipRequirements;
}
