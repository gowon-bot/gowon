import { gql } from "apollo-server-express";
import { GowonContext } from "../../lib/context/Context";
import { LilacAPIService } from "./LilacAPIService";
import {
  LilacArtistCountFilters,
  LilacArtistCountsPage,
  LilacArtistFilters,
  LilacArtistsPage,
  LilacTagInput,
  LilacTagsPage,
  LilacUserInput,
} from "./LilacAPIService.types";

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

            tags {
              name
            }
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
    >(ctx, query, { filters }, false);

    return response.artists;
  }

  async listWithTags(
    ctx: GowonContext,
    filters: LilacArtistFilters & { tags: LilacTagInput[] }
  ): Promise<{ artists: LilacArtistsPage; tags: LilacTagsPage }> {
    const query = gql`
      query list($filters: ArtistsFilters!, $tags: [TagInput!]!) {
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

        tags(filters: { inputs: $tags }) {
          tags {
            id
            name
          }
        }
      }
    `;

    const response = await this.query<
      { artists: LilacArtistsPage; tags: LilacTagsPage },
      { filters: LilacArtistFilters; tags: LilacTagInput[] }
    >(ctx, query, { filters, tags: filters.tags }, false);

    return response;
  }

  async listCounts(
    ctx: GowonContext,
    filters: LilacArtistCountFilters
  ): Promise<LilacArtistCountsPage> {
    const query = gql`
      query list($filters: ArtistCountsFilters!) {
        artistCounts(filters: $filters) {
          artistCounts {
            artist {
              id
              name
            }
            playcount
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
      { artistCounts: LilacArtistCountsPage },
      { filters: LilacArtistCountFilters }
    >(ctx, query, { filters }, false);

    return response.artistCounts;
  }

  async getTagsForArtistsMap(
    ctx: GowonContext,
    artists: string[],
    fetchTagsForMissing = false
  ): Promise<{
    [artistName: string]: string[];
  }> {
    const response = await this.list(ctx, {
      fetchTagsForMissing,
      inputs: artists.map((a) => ({ name: a })),
    });

    return response.artists.reduce((acc, val) => {
      acc[val.name] = val.tags.map((t) => t.name);

      return acc;
    }, {} as { [artistName: string]: string[] });
  }

  async filterByTag<T extends { name: string }>(
    ctx: GowonContext,
    artists: T[],
    allowedTags: string[]
  ): Promise<T[]> {
    allowedTags = allowedTags.map((t) => t.toLowerCase());

    const artistNames = artists.map((a) => a.name.toLowerCase());

    const tagMap = await this.getTagsForArtistsMap(ctx, artistNames);

    const filteredArtists = artists.filter((a) => {
      return (
        tagMap[a.name] && tagMap[a.name]?.some((t) => allowedTags.includes(t))
      );
    });

    return filteredArtists;
  }

  async getArtistCountsForTags(
    ctx: GowonContext,
    user: LilacUserInput,
    tags: string[]
  ): Promise<LilacArtistCountsPage[]> {
    const responses = [] as LilacArtistCountsPage[];

    for (const tag of tags) {
      responses.push(
        await this.listCounts(ctx, {
          tags: [{ name: tag }],
          users: [user],
          pagination: { perPage: 3, page: 1 },
        })
      );
    }

    return responses;
  }
}
