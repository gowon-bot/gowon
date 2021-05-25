import { displayNumber } from "../../views/displays";
import { BaseNowPlayingComponent } from "./BaseNowPlayingComponent";

const artistPlaysRequirements = ["artistInfo", "artistPlays"] as const;

export class ArtistPlaysComponent extends BaseNowPlayingComponent<
  typeof artistPlaysRequirements
> {
  static componentName = "artist-plays";
  readonly requirements = artistPlaysRequirements;

  present() {
    const { plays, name } = this.getPlays();

    if (plays && name) {
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

  private getPlays(): { plays: number | undefined; name: string | undefined } {
    if (this.values.artistInfo?.userPlaycount) {
      return {
        plays: this.values.artistInfo.userPlaycount,
        name: this.values.artistInfo.name,
      };
    } else if (this.values.artistPlays.length) {
      return {
        plays: this.values.artistPlays[0].playcount,
        name: this.values.artistPlays[0].artist.name,
      };
    }

    return { plays: undefined, name: undefined };
  }
}
