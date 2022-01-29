import { displayNumber } from "../../views/displays";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const albumPlaysRequirements = ["albumPlays"] as const;

export class AlbumPlaysComponent extends BaseNowPlayingComponent<
  typeof albumPlaysRequirements
> {
  static componentName = "album-plays";
  readonly requirements = albumPlaysRequirements;

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
