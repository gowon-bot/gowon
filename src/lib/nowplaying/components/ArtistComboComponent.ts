import { displayNumber } from "../../views/displays";
import { getCombo, playsQuery } from "../helpers/combo";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const artistComboRequirements = [] as const;

export class ArtistComboComponent extends BaseNowPlayingComponent<
  typeof artistComboRequirements
> {
  static componentName = "artist-combo";
  readonly requirements = artistComboRequirements;

  async present() {
    const combo = await getCombo(
      this.ctx,
      playsQuery(this.nowPlaying),
      this.values
    );

    if (combo.artist.plays > 1) {
      return {
        size: 1,
        string: `${displayNumber(
          combo.artist.plays,
          `${this.nowPlaying.artist} play`
        )} in a row${combo.artist.plays > 100 ? " 🔥" : ""}`,
      };
    }

    return { string: "", size: 0 };
  }
}
