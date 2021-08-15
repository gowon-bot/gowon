import { getOrdinal } from "../../../helpers";
import { displayNumber } from "../../views/displays";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const artistRankRequirements = ["serverArtistRank"] as const;

export class ServerArtistRankComponent extends BaseNowPlayingComponent<
  typeof artistRankRequirements
> {
  static componentName = "server-artist-rank";
  readonly requirements = artistRankRequirements;

  present() {
    const artistRank = this.values.serverArtistRank;

    if (artistRank && artistRank.rank != -1) {
      return {
        string: `Server rank: ${getOrdinal(artistRank.rank)}/${displayNumber(
          artistRank.listeners
        )}`,
        size: 1,
      };
    }

    return { string: "", size: 0 };
  }
}
