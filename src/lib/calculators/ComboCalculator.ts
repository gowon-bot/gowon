import { Track } from "../../services/LastFMService.types";
import { Paginator } from "../Paginator";

export interface ComboDetails {
  plays: number;
  name: string;
  nowplaying: boolean;
  hitMax: boolean;
}
export interface Combo {
  artist: ComboDetails;
  album: ComboDetails;
  track: ComboDetails;
  hasAnyConsecutivePlays: boolean;
}

type Entity = "artist" | "track" | "album";

export class ComboCalculator {
  private combo: Partial<Combo> = {};
  private streakEnded = {
    artist: false,
    album: false,
    track: false,
  };

  private shouldContinueStreak(track: Track, entity: Entity): boolean {
    let entityName =
      entity === "album" || entity === "artist"
        ? track[entity]["#text"]
        : track.name;

    return (
      this.streakEnded[entity] !== true &&
      (this.combo[entity]?.name === undefined ||
        this.combo[entity]?.name === entityName)
    );
  }

  private shouldBreak(): boolean {
    return (
      this.streakEnded.album &&
      this.streakEnded.artist &&
      this.streakEnded.track
    );
  }

  private setCombo(entity: Entity, name: string, track: Track, last: boolean) {
    let nowplaying = track["@attr"]?.nowplaying === "true" ?? false;

    if (this.combo[entity]) {
      this.combo[entity] = {
        name: this.combo[entity]!.name,
        plays: this.combo[entity]!.plays + 1,
        nowplaying: this.combo[entity]!.nowplaying,
        hitMax: last,
      };
    } else {
      this.combo[entity] = {
        name,
        nowplaying,
        plays: nowplaying ? 0 : 1,
        hitMax: false,
      };
    }
  }

  async calculate(recentTracks: Paginator): Promise<Combo> {
    for await (let page of recentTracks.iterator()) {
      let tracks =
        recentTracks.currentPage === 1 ? page.track : page.track.slice(1);

      for (let trackIndex = 0; trackIndex < tracks.length; trackIndex++) {
        const track = tracks[trackIndex];

        let last =
          trackIndex === tracks.length - 1 &&
          recentTracks.currentPage === recentTracks.maxPages;

        if (this.shouldContinueStreak(track, "artist")) {
          this.setCombo("artist", track.artist["#text"], track, last);
        } else if (!this.streakEnded.artist) this.streakEnded.artist = true;

        if (this.shouldContinueStreak(track, "album")) {
          this.setCombo("album", track.album["#text"], track, last);
        } else if (!this.streakEnded.album) this.streakEnded.album = true;

        if (this.shouldContinueStreak(track, "track")) {
          this.setCombo("track", track.name, track, last);
        } else if (!this.streakEnded.track) this.streakEnded.track = true;

        if (this.shouldBreak()) break;
      }
      if (this.shouldBreak()) break;
    }

    return {
      ...this.combo,
      hasAnyConsecutivePlays:
        (this.combo.artist?.plays || 0) +
          (this.combo.album?.plays || 0) +
          (this.combo.track?.plays || 0) >
        0,
    } as Combo;
  }
}
