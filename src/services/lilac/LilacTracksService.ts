import { gql } from "apollo-server-express";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import {
  LilacAmbiguousTrackCount,
  LilacAmbiguousTrackCountsPage,
  LilacTrackCountFilters,
  LilacTrackCountsPage,
} from "./LilacAPIService.types";

export class LilacTracksService extends LilacAPIService {
  public async listCounts(
    ctx: GowonContext,
    filters: LilacTrackCountFilters
  ): Promise<LilacTrackCountsPage> {
    const query = gql`
      query trackCounts($filters: TrackCountsFilters!) {
        trackCounts(filters: $filters) {
          trackCounts {
            playcount

            track {
              name

              artist {
                name
              }

              album {
                name
              }
            }
          }
        }
      }
    `;

    const response = await this.query<
      { trackCounts: LilacTrackCountsPage },
      { filters: LilacTrackCountFilters }
    >(ctx, query, { filters }, false);

    return response.trackCounts;
  }

  public async listAmbiguousCounts(
    ctx: GowonContext,
    filters: LilacTrackCountFilters
  ): Promise<LilacAmbiguousTrackCountsPage> {
    const query = gql`
      query ambiguousTrackCounts($filters: TrackCountsFilters!) {
        ambiguousTrackCounts(filters: $filters) {
          trackCounts {
            playcount
            firstScrobbled
            lastScrobbled

            track {
              name

              artist {
                name
              }
            }
          }
        }
      }
    `;

    const response = await this.query<
      { ambiguousTrackCounts: LilacAmbiguousTrackCountsPage },
      { filters: LilacTrackCountFilters }
    >(ctx, query, { filters }, false);

    return response.ambiguousTrackCounts;
  }

  public async getAmbiguousCount(
    ctx: GowonContext,
    discordID: string,
    artist: string,
    track: string
  ): Promise<LilacAmbiguousTrackCount | undefined> {
    const response = await this.listAmbiguousCounts(ctx, {
      track: { name: track, artist: { name: artist } },
      users: [{ discordID }],
    });

    return response.trackCounts[0];
  }
}
