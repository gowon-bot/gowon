import { numberDisplay } from "../../../helpers";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const albumPlaysRequirements = ["albumPlays"] as const;

export class AlbumPlaysComponent extends BaseNowPlayingComponent<
  typeof albumPlaysRequirements
> {
  static componentName = "album-plays";
  readonly requirements = albumPlaysRequirements;

  present() {
    const albumPlays = this.values.albumPlays[0];

    if (albumPlays) {
      return {
        string: `${numberDisplay(
          albumPlays.playcount,
          "scrobble"
        )} of this album`,
        size: 1,
      };
    }

    return { string: "", size: 0 };
  }
}
