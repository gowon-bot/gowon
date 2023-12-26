import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

const fishyReminderDependencies = ["fishyProfile"] as const;

export class FishyReminderComponent extends BaseNowPlayingComponent<
  typeof fishyReminderDependencies
> {
  static componentName = "fishy-reminder";
  static friendlyName = "Fishy reminder";
  static patronOnly = true;
  readonly dependencies = fishyReminderDependencies;

  present() {
    if (this.values.fishyProfile?.canFish()) {
      return { size: 0, string: "🐟" };
    }

    return { size: 0, string: "" };
  }
}
