import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const fishyReminderRequirements = ["fishyProfile"] as const;

export class FishyReminderComponent extends BaseNowPlayingComponent<
  typeof fishyReminderRequirements
> {
  static componentName = "fishy-reminder";
  static friendlyName = "Fishy reminder";
  static patronOnly = true;
  readonly requirements = fishyReminderRequirements;

  present() {
    console.log(this.values.fishyProfile);

    if (this.values.fishyProfile?.canFish()) {
      return { size: 0, string: "🐟" };
    }

    return { size: 0, string: "" };
  }
}
