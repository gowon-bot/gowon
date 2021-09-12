import gql from "graphql-tag";
import { displayNumber } from "../../../lib/views/displays";
import { BaseService, BaseServiceContext } from "../../BaseService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { MirrorballService } from "../MirrorballService";
import { ArtistInput, MirrorballTag } from "../MirrorballTypes";

export class TagsService extends BaseService {
  get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
  }

  async getTagsForArtists(
    ctx: BaseServiceContext,
    artists: ArtistInput[]
  ): Promise<MirrorballTag[]> {
    this.log(
      ctx,
      `Getting tags for ${displayNumber(artists.length, "artist")}`
    );

    const query = gql`
      query tags($artists: [ArtistInput!]!) {
        tags(settings: { artists: $artists }) {
          tags {
            name
            occurrences
          }
        }
      }
    `;

    const response = await this.mirrorballService.query<{
      tags: { tags: MirrorballTag[] };
    }>(ctx, query, { artists });

    return response.tags.tags;
  }

  async getTagsForArtistsMap(
    ctx: BaseServiceContext,
    artists: string[],
    requireTags = false
  ): Promise<{
    [artistName: string]: string[];
  }> {
    this.log(
      ctx,
      `Getting tags for ${displayNumber(artists.length, "artist")}`
    );

    const query = gql`
      query artists($artists: [ArtistInput!]!, $requireTags: Boolean) {
        artists(inputs: $artists, requireTagsForMissing: $requireTags) {
          name
          tags
        }
      }
    `;

    const response = await this.mirrorballService.query<{
      artists: { name: string; tags: string[] }[];
    }>(ctx, query, {
      requireTags,
      artists: artists.map((a) => ({ name: a })),
    });

    return response.artists.reduce((acc, val) => {
      acc[val.name] = val.tags;

      return acc;
    }, {} as { [artistName: string]: string[] });
  }

  async filter<T extends { name: string }>(
    ctx: BaseServiceContext,
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
}
