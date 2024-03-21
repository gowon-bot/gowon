import { getOrdinal } from "../../../helpers";
import { displayNumber } from "../../ui/displays";
import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

const artistRankDependencies = ["globalArtistRank"] as const;

export class GlobalArtistRankComponent extends BaseNowPlayingComponent<
  typeof artistRankDependencies
> {
  static componentName = "global-artist-rank";
  static friendlyName = "Global artist rank";
  readonly dependencies = artistRankDependencies;

  render() {
    const artistRank = this.values.globalArtistRank;

    if (artistRank && artistRank.rank != -1) {
      return {
        string: `Global rank: ${getOrdinal(artistRank.rank)}/${displayNumber(
          artistRank.totalListeners
        )}`,
        size: 1,
      };
    }

    return { string: "", size: 0 };
  }
}
