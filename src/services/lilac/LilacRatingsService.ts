import { Observable } from "@apollo/client";
import { gql } from "apollo-server-express";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import {
  LilacRateYourMusicArtist,
  LilacRatingsFilters,
  LilacRatingsPage,
  LilacUserInput,
  RatingsImportProgress,
} from "./LilacAPIService.types";
import { userToUserInput } from "./helpers";

export class LilacRatingsService extends LilacAPIService {
  async ratings(
    ctx: GowonContext,
    filters: LilacRatingsFilters
  ): Promise<LilacRatingsPage> {
    const query = gql`
      query ratings($filters: RatingsFilters!) {
        ratings(filters: $filters) {
          ratings {
            rateYourMusicAlbum {
              title
              artistName
              artistNativeName
              releaseYear
            }
            rating
          }

          pagination {
            totalItems
            totalPages
            currentPage
            perPage
          }
        }
      }
    `;

    const response = await this.query<
      { ratings: LilacRatingsPage },
      { filters: LilacRatingsFilters }
    >(ctx, query, { filters }, false);

    return response.ratings;
  }

  async getArtist(
    ctx: GowonContext,
    keywords: string
  ): Promise<LilacRateYourMusicArtist> {
    const query = gql`
      query rateYourMusicArtist($keywords: String!) {
        rateYourMusicArtist(keywords: $keywords) {
          artistName
          artistNativeName
        }
      }
    `;

    const response = await this.query<
      { rateYourMusicArtist: LilacRateYourMusicArtist },
      { keywords: string }
    >(ctx, query, { keywords });

    return response.rateYourMusicArtist;
  }

  async ratingsTaste(
    ctx: GowonContext,
    variables: { sender: LilacUserInput; mentioned: LilacUserInput }
  ): Promise<{
    sender: LilacRatingsPage;
    mentioned: LilacRatingsPage;
  }> {
    const query = gql`
      query stats($sender: UserInput, $mentioned: UserInput) {
        sender: ratings(filters: { user: $sender }) {
          ratings {
            rating
            rateYourMusicAlbum {
              rateYourMusicID
              title
              artistName
            }
          }
          pagination {
            totalItems
          }
        }

        mentioned: ratings(filters: { user: $mentioned }) {
          ratings {
            rating
            rateYourMusicAlbum {
              rateYourMusicID
              title
              artistName
            }
          }
          pagination {
            totalItems
          }
        }
      }
    `;

    const response = await this.query<
      {
        sender: LilacRatingsPage;
        mentioned: LilacRatingsPage;
      },
      { sender: LilacUserInput; mentioned: LilacUserInput }
    >(ctx, query, variables);

    return response;
  }

  public async import(
    ctx: GowonContext,
    csv: string,
    user: LilacUserInput
  ): Promise<void> {
    const mutation = gql`
      mutation importRatings($ratingsCsv: String!, $user: UserInput!) {
        importRatings(ratingsCsv: $ratingsCsv, user: $user)
      }
    `;

    await this.mutate(ctx, mutation, { ratingsCsv: csv, user });
  }

  public importProgress(
    ctx: GowonContext,
    user: LilacUserInput
  ): Observable<RatingsImportProgress> {
    const subscription = gql`
      subscription RatingsImportProgress($user: UserInput!) {
        ratingsImport(user: $user) {
          stage
          count
          error
        }
      }
    `;

    return this.subscribe<
      { ratingsImport: RatingsImportProgress },
      { user: LilacUserInput }
    >(ctx, subscription, { user: userToUserInput(user) }).map(
      (data) => data.ratingsImport
    );
  }
}
