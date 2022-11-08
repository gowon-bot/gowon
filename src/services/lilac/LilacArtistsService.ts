import { gql } from "apollo-server-express";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import { LilacArtistFilters, LilacArtistsPage } from "./LilacAPIService.types";

export class LilacArtistsService extends LilacAPIService {
  async list(
    ctx: GowonContext,
    filters: LilacArtistFilters
  ): Promise<LilacArtistsPage> {
    const query = gql`
      query list($filters: ArtistsFilters!) {
        artists(filters: $filters) {
          artists {
            id
            name
          }

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
      { artists: LilacArtistsPage },
      { filters: LilacArtistFilters }
    >(ctx, query, { filters });

    return response.artists;
  }
}
