import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

export class UnusedComponent extends BaseNowPlayingComponent<never[]> {
  static componentName = "loved";
  readonly requirements = [];

  present() {
    return {
      string: `You can customize what gets shown here! See ${this.values.prefix}npc help for more information`,
      size: 4,
    };
  }
}
