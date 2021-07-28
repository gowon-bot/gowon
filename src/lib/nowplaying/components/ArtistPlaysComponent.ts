import { displayNumber } from "../../views/displays";
import { getArtistPlays } from "../helpers/artist";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const artistPlaysRequirements = ["artistInfo", "artistPlays"] as const;

export class ArtistPlaysComponent extends BaseNowPlayingComponent<
  typeof artistPlaysRequirements
> {
  static componentName = "artist-plays";
  readonly requirements = artistPlaysRequirements;

  present() {
    const { plays, name } = getArtistPlays(this.values);

    if (plays !== undefined && name) {
      return {
        string: `${displayNumber(plays, `${name} scrobble`)}`,
        size: 1,
      };
    } else {
      return {
        string: `No data on last.fm for ${this.nowPlaying.artist}`,
        size: 2,
      };
    }
  }
}
