import { RedirectsService } from "../../services/dbservices/RedirectsService";
import { ConvertedRecentTracks } from "../../services/LastFM/converters/RecentTracks";
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

interface Report {
  top: Top;
  total: TotalCounts;
}

export class ReportCalculator {
  private top: Top = {
    artists: {},
    albums: {},
    tracks: {},
  };

  constructor(
    private redirectsService: RedirectsService,
    private tracks: ConvertedRecentTracks
  ) {}

  redirectsCache = new RedirectsCache(this.redirectsService);

  async calculate(): Promise<Report> {
    for (let track of this.tracks.tracks) {
      this.logCount(
        "tracks",
        track.name,
        await this.redirectsCache.getRedirect(track.artist)
      );
      this.logCount(
        "artists",
        await this.redirectsCache.getRedirect(track.artist)
      );
      if (track.album)
        this.logCount(
          "albums",
          track.album,
          await this.redirectsCache.getRedirect(track.artist)
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
