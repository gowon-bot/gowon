import { gql } from "@apollo/client";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import {
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
}
