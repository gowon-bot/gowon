import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

export class UnusedComponent extends BaseNowPlayingComponent<never[]> {
  static componentName = "loved";
  readonly requirements = [];

  present() {
    return {
      string: `You can customize what gets shown here! See !npc help for more information`,
      size: 4,
    };
  }
}
