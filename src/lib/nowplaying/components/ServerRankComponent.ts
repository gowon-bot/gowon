import { getOrdinal } from "../../../helpers";
import { displayNumber } from "../../ui/displays";
import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

const artistRankDependencies = ["serverArtistRank"] as const;

export class ServerArtistRankComponent extends BaseNowPlayingComponent<
  typeof artistRankDependencies
> {
  static componentName = "server-artist-rank";
  static friendlyName = "Server artist rank";
  readonly dependencies = artistRankDependencies;

  render() {
    const artistRank = this.values.serverArtistRank;

    console.log(artistRank);

    if (artistRank && artistRank.rank != -1) {
      return {
        string: `Server rank: ${getOrdinal(artistRank.rank)}/${displayNumber(
          artistRank.totalListeners
        )}`,
        size: 1,
      };
    }

    return { string: "", size: 0 };
  }
}
