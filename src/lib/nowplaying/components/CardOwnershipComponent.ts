import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const cardOwnershipRequirements = ["albumCard"] as const;

export class CardOwnershipComponent extends BaseNowPlayingComponent<
  typeof cardOwnershipRequirements
> {
  static componentName = "card-ownership";
  static friendlyName = "Card ownership";
  static secret = true;
  readonly requirements = cardOwnershipRequirements;

  present() {
    return { string: "", size: 0 };
  }
}
