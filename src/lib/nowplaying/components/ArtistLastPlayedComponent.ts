import { PlaceholderNowPlayingComponent } from "../base/PlaceholderNowPlayingComponent";

const artistLastPlayedDependencies = ["artistCount"] as const;

export class ArtistLastPlayedComponent extends PlaceholderNowPlayingComponent<
  typeof artistLastPlayedDependencies
> {
  static componentName = "artist-last-played";
  static friendlyName = "Artist last played";
  readonly dependencies = artistLastPlayedDependencies;
}
