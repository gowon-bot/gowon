import { PlaceholderNowPlayingComponent } from "../base/PlaceholderNowPlayingComponent";

const albumLastPlayedDependencies = ["albumCount"] as const;

// Placeholder for LastPlayedComponent
export class AlbumLastPlayedComponent extends PlaceholderNowPlayingComponent<
  typeof albumLastPlayedDependencies
> {
  static componentName = "album-last-played";
  static friendlyName = "Album last played";
  readonly dependencies = albumLastPlayedDependencies;
}
