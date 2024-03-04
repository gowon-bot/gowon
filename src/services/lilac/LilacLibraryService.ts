import { gql } from "@apollo/client";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import {
  LilacAlbumCountFilters,
  LilacAlbumCountsPage,
  LilacArtistCount,
  LilacArtistCountFilters,
  LilacArtistFilters,
  LilacArtistsPage,
  LilacScrobbleFilters,
  LilacScrobblesPage,
  LilacTrackCountFilters,
  LilacTrackCountsPage,
} from "./LilacAPIService.types";

export class LilacLibraryService extends LilacAPIService {
  async scrobbleList(
    ctx: GowonContext,
    filters: LilacScrobbleFilters
  ): Promise<LilacScrobblesPage> {
    const query = gql`
      query scrobbleList($filters: ScrobblesFilters!) {
        scrobbles(filters: $filters) {
          pagination {
            totalItems
            currentPage
            totalPages
            perPage
          }

          scrobbles {
            scrobbledAt
            artist {
              name
            }
            album {
              name
            }
            track {
              name
            }
          }
        }
      }
    `;

    const response = await this.query<
      { scrobbles: LilacScrobblesPage },
      { filters: LilacScrobbleFilters }
    >(ctx, query, { filters }, false);

    return response.scrobbles;
  }

  async artistTopAlbums(
    ctx: GowonContext,
    filters: LilacAlbumCountFilters,
    artistsFilters: LilacArtistFilters
  ): Promise<{
    artists: Omit<LilacArtistsPage, "pagination">;
    albumCounts: Omit<LilacAlbumCountsPage, "pagination">;
  }> {
    const query = gql`
      query albumCounts(
        $filters: AlbumCountsFilters!
        $artistsFilters: ArtistsFilters!
      ) {
        artists(filters: $artistsFilters) {
          artists {
            name
          }
        }

        albumCounts(filters: $filters) {
          albumCounts {
            playcount

            album {
              name
            }
          }
        }
      }
    `;

    const response = await this.query<
      { albumCounts: LilacAlbumCountsPage; artists: LilacArtistsPage },
      { filters: LilacAlbumCountFilters; artistsFilters: LilacArtistFilters }
    >(ctx, query, { filters, artistsFilters }, false);

    return response;
  }

  async trackCounts(
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

  public async getScrobbleCount(
    ctx: GowonContext,
    discordID: string
  ): Promise<number> {
    const query = gql`
      query scrobbleCount($filters: ScrobblesFilters!) {
        scrobbles(filters: $filters) {
          pagination {
            totalItems
            currentPage
            totalPages
            perPage
          }
        }
      }
    `;

    const response = await this.query<
      { scrobbles: LilacScrobblesPage },
      { filters: LilacScrobbleFilters }
    >(ctx, query, { filters: { user: { discordID: discordID } } });

    return response?.scrobbles?.pagination?.totalItems;
  }

  public async getArtistCount(
    ctx: GowonContext,
    discordID: string,
    artist: string
  ): Promise<LilacArtistCount | undefined> {
    const query = gql`
      query artistCount($filters: ArtistCountsFilters!) {
        artistCounts(filters: $filters) {
          artistCounts {
            playcount
            lastScrobbled
            firstScrobbled
            artist {
              name
            }
          }
        }
      }
    `;

    const response = await this.query<
      { artistCounts: { artistCounts: LilacArtistCount[] } },
      { filters: LilacArtistCountFilters }
    >(ctx, query, {
      filters: { users: [{ discordID }], artists: [{ name: artist }] },
    });

    console.log(response.artistCounts.artistCounts);

    return response.artistCounts.artistCounts[0];
  }
}
