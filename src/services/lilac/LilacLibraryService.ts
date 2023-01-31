import { gql } from "@apollo/client";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import {
  LilacAlbumCountFilters,
  LilacAlbumCountsPage,
  LilacArtistFilters,
  LilacArtistsPage,
  LilacScrobbleFilters,
  LilacScrobblesPage,
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
}
