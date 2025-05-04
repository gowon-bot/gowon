import { PlaceholderNowPlayingComponent } from "../base/PlaceholderNowPlayingComponent";

const artistRankDependencies = ["serverArtistRank"] as const;

export class ServerArtistRankComponent extends PlaceholderNowPlayingComponent<
  typeof artistRankDependencies
> {
  static componentName = "server-artist-rank";
  static friendlyName = "Server artist rank";
  readonly dependencies = artistRankDependencies;
}
