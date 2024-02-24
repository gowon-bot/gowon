import { Emoji } from "../../../emoji/Emoji";
import { displayNumber } from "../../../ui/displays";
import { BaseNowPlayingComponent } from "../../base/BaseNowPlayingComponent";

const comboDependencies = ["combo"] as const;

// Only used by NowPlayingCombo
export class ComboComponent extends BaseNowPlayingComponent<
  typeof comboDependencies
> {
  static componentName = "combo";
  static friendlyName = "Combo";
  readonly dependencies = comboDependencies;

  render() {
    if (this.values.combo) {
      return {
        string: `${displayNumber(this.values.combo.artist.plays)} in a row ${
          this.values.combo.artist.plays > 100 ? Emoji.fire : ""
        }`,
        size: 1,
        placeAfter: ["artist-plays"],
      };
    }

    return { size: 0, string: "" };
  }
}
