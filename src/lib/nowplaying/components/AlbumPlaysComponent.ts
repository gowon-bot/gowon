import { displayNumber } from "../../ui/displays";
import { BaseNowPlayingComponent } from "../base/BaseNowPlayingComponent";

const albumPlaysDependencies = ["albumPlays"] as const;

export class AlbumPlaysComponent extends BaseNowPlayingComponent<
  typeof albumPlaysDependencies
> {
  static componentName = "album-plays";
  static friendlyName = "Album plays";
  readonly dependencies = albumPlaysDependencies;

  present() {
    const albumPlays = this.values.albumPlays[0];

    return {
      string: displayNumber(
        albumPlays ? albumPlays.playcount : 0,
        "album scrobble"
      ),
      size: 1,
    };
  }
}
