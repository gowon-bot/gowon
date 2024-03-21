import { displayNumber } from "../../ui/displays";
import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

const albumPlaysDependencies = ["albumCount"] as const;

export class AlbumPlaysComponent extends BaseNowPlayingComponent<
  typeof albumPlaysDependencies
> {
  static componentName = "album-plays";
  static friendlyName = "Album plays";
  readonly dependencies = albumPlaysDependencies;

  render() {
    return {
      string: displayNumber(
        this.values.albumCount ? this.values.albumCount.playcount : 0,
        "album scrobble"
      ),
      size: 1,
    };
  }
}

const lastFMAlbumPlaysDependencies = ["albumInfo"] as const;

// Only used by NowPlayingAlbum
export class LastFMAlbumPlaysComponent extends BaseNowPlayingComponent<
  typeof lastFMAlbumPlaysDependencies
> {
  static componentName = "album-plays";
  static friendlyName = "Album plays";
  readonly dependencies = lastFMAlbumPlaysDependencies;

  render() {
    const albumPlays = this.values.albumInfo?.userPlaycount;

    return {
      string: displayNumber(albumPlays ? albumPlays : 0, "album scrobble"),
      size: 1,
    };
  }
}
