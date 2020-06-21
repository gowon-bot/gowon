import { RecentTracks, Track } from "../services/LastFMService.types";

export interface ComboDetails {
  plays: number;
  name: string;
  nowplaying: boolean;
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

  private setCombo(entity: Entity, name: string, track: Track) {
    let nowplaying = track["@attr"]?.nowplaying === "true" ?? false;

    if (this.combo[entity]) {
      this.combo[entity] = {
        name: this.combo[entity]!.name,
        plays: this.combo[entity]!.plays + 1,
        nowplaying: this.combo[entity]!.nowplaying,
      };
    } else {
      this.combo[entity] = {
        name,
        nowplaying,
        plays: nowplaying ? 0 : 1,
      };
    }
  }

  calculate(recentTracks: RecentTracks): Combo {
    for (let track of recentTracks.track) {
      if (this.shouldContinueStreak(track, "artist")) {
        this.setCombo("artist", track.artist["#text"], track);
      } else if (!this.streakEnded.artist) this.streakEnded.artist = true;

      if (this.shouldContinueStreak(track, "album")) {
        this.setCombo("album", track.album["#text"], track);
      } else if (!this.streakEnded.album) this.streakEnded.album = true;

      if (this.shouldContinueStreak(track, "track")) {
        this.setCombo("track", track.name, track);
      } else if (!this.streakEnded.track) this.streakEnded.track = true;

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
