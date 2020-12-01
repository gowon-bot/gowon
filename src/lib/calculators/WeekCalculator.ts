import { RedirectsService } from "../../services/dbservices/RedirectsService";
import { RecentTracks } from "../../services/LastFM/LastFMService.types";
import { RedirectsCache } from "../caches/RedirectsCache";

interface Count {
  [name: string]: number;
}

interface Top {
  artists: Count;
  albums: Count;
  tracks: Count;
}

interface TotalCounts {
  artists: number;
  albums: number;
  tracks: number;
}

interface Week {
  top: Top;
  total: TotalCounts;
}

export class WeekCalculator {
  private top: Top = {
    artists: {},
    albums: {},
    tracks: {},
  };

  constructor(
    private redirectsService: RedirectsService,
    private weeklyTracks: RecentTracks
  ) {}

  redirectsCache = new RedirectsCache(this.redirectsService);

  async calculate(): Promise<Week> {
    for (let track of this.weeklyTracks.track) {
      this.logCount(
        "tracks",
        track.name,
        await this.redirectsCache.getRedirect(track.artist["#text"])
      );
      this.logCount(
        "artists",
        await this.redirectsCache.getRedirect(track.artist["#text"])
      );
      if (track.album["#text"])
        this.logCount(
          "albums",
          track.album["#text"],
          await this.redirectsCache.getRedirect(track.artist["#text"])
        );
    }

    return {
      top: this.top,
      total: this.getTotalCounts(),
    };
  }

  private logCount(
    category: "tracks" | "albums",
    name: string,
    artist: string
  ): void;
  private logCount(category: "artists", name: string): void;
  private logCount(
    category: "tracks" | "artists" | "albums",
    name: string,
    artist?: string
  ): void {
    let entity = artist ? `${artist} - ${name}` : name;

    if (!this.top[category][entity]) this.top[category][entity] = 0;

    this.top[category][entity] += 1;
  }

  private getTotalCounts(): TotalCounts {
    return {
      artists: Object.values(this.top.artists).length,
      albums: Object.values(this.top.albums).length,
      tracks: Object.values(this.top.tracks).length,
    };
  }
}
