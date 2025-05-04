import { PlaceholderNowPlayingComponent } from "../base/PlaceholderNowPlayingComponent";

const artistRankDependencies = ["globalArtistRank"] as const;

export class GlobalArtistRankComponent extends PlaceholderNowPlayingComponent<
  typeof artistRankDependencies
> {
  static componentName = "global-artist-rank";
  static friendlyName = "Global artist rank";
  readonly dependencies = artistRankDependencies;
}
