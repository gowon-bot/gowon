import { displayNumber } from "../../../ui/displays";
import { BaseNowPlayingComponent } from "../../base/BaseNowPlayingComponent";

const comboDependencies = ["combo"] as const;

export class ComboComponent extends BaseNowPlayingComponent<
  typeof comboDependencies
> {
  static componentName = "combo";
  static friendlyName = "Com";
  static patronOnly = true;
  readonly dependencies = comboDependencies;

  present() {
    if (this.values.combo) {
      return {
        string: `${displayNumber(this.values.combo.artist.plays)} in a row ${
          this.values.combo.artist.plays > 100 ? "🔥" : ""
        }`,
        size: 1,
        placeAfter: ["artist-plays"],
      };
    }

    return { size: 0, string: "" };
  }
}
