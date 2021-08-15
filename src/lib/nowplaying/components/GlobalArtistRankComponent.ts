import { getOrdinal } from "../../../helpers";
import { displayNumber } from "../../views/displays";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const artistRankRequirements = ["globalArtistRank"] as const;

export class GlobalArtistRankComponent extends BaseNowPlayingComponent<
  typeof artistRankRequirements
> {
  static componentName = "global-artist-rank";
  readonly requirements = artistRankRequirements;

  present() {
    const artistRank = this.values.globalArtistRank;

    if (artistRank && artistRank.rank != -1) {
      return {
        string: `Global rank: ${getOrdinal(artistRank.rank)}/${displayNumber(
          artistRank.listeners
        )}`,
        size: 1,
      };
    }

    return { string: "", size: 0 };
  }
}
