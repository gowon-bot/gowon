import { PlaceholderNowPlayingComponent } from "../base/PlaceholderNowPlayingComponent";

const trackLastPlayedDependencies = ["ambiguousTrackCount"] as const;

export class TrackLastPlayedComponent extends PlaceholderNowPlayingComponent<
  typeof trackLastPlayedDependencies
> {
  static componentName = "track-last-played";
  static friendlyName = "Track last played";
  readonly dependencies = trackLastPlayedDependencies;
}
