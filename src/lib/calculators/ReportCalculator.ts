import gql from "graphql-tag";
import { RedirectsService } from "../../services/dbservices/RedirectsService";
import { RecentTracks } from "../../services/LastFM/converters/RecentTracks";
import { MirrorballTag } from "../../services/mirrorball/MirrorballTypes";
import { RedirectsCache } from "../caches/RedirectsCache";
import { mirrorballClient } from "../indexing/client";

interface Count {
  [name: string]: number;
}

interface Top {
  artists: Count;
  albums: Count;
  tracks: Count;
  tags: MirrorballTag[];
}

interface TotalCounts {
  artists: number;
  albums: number;
  tracks: number;
  tags: number;
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
    tags: [],
  };

  constructor(
    private redirectsService: RedirectsService,
    private tracks: RecentTracks
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
    };
  }

  private async countTags(): Promise<void> {
    const query = gql`
      query tags($artists: [ArtistInput!]!) {
        tags(settings: { artists: $artists }, requireTagsForMissing: true) {
          tags {
            name
            occurrences
          }
        }
      }
    `;

    const artists = Object.keys(this.top.artists).map((name) => ({ name }));

    const response = await mirrorballClient.query<{
      tags: { tags: MirrorballTag[] };
    }>({
      query,
      variables: { artists },
    });

    this.top.tags = response.data.tags.tags;
  }
}
