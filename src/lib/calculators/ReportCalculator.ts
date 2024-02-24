import { RecentTracks } from "../../services/LastFM/converters/RecentTracks";
import { LilacTag } from "../../services/lilac/LilacAPIService.types";
import { LilacTagsService } from "../../services/lilac/LilacTagsService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { RedirectsCache } from "../caches/RedirectsCache";
import { GowonContext } from "../context/Context";

export interface ReportCount {
  [name: string]: number;
}

interface Top {
  artists: ReportCount;
  albums: ReportCount;
  tracks: ReportCount;
  tags: LilacTag[];
}

interface TotalCounts {
  artists: number;
  albums: number;
  tracks: number;
  tags: number;
  scrobbles: number;
}

export interface Report {
  top: Top;
  total: TotalCounts;
}

export class ReportCalculator {
  private top: Top = {
    artists: {},
    albums: {},
    tracks: {},
    tags: [],
  };

  private lilacTagsService = ServiceRegistry.get(LilacTagsService);

  constructor(private ctx: GowonContext, private tracks: RecentTracks) {}

  redirectsCache = new RedirectsCache(this.ctx);

  async calculate(): Promise<Report> {
    await this.redirectsCache.initialCache(
      this.ctx,
      Array.from(new Set(this.tracks.withoutNowPlaying.map((t) => t.artist)))
    );

    for (const track of this.tracks.withoutNowPlaying) {
      this.logCount(
        "tracks",
        track.name,
        await this.redirectsCache.getRedirect(track.artist)
      );

      this.logCount(
        "artists",
        await this.redirectsCache.getRedirect(track.artist)
      );

      if (track.album) {
        this.logCount(
          "albums",
          track.album,
          await this.redirectsCache.getRedirect(track.artist)
        );
      }
    }

    await this.countTags();

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
      tags: Object.values(this.top.tags).length,
      scrobbles: this.tracks.meta.total,
    };
  }

  private async countTags(): Promise<void> {
    const artists = Object.keys(this.top.artists).map((name) => ({ name }));

    const response = await this.lilacTagsService.list(this.ctx, { artists });

    this.top.tags = response.tags;
  }
}
