import gql from "graphql-tag";
import { mirrorballClient } from "../../../lib/indexing/client";
import { BaseService } from "../../BaseService";
import { ArtistInput, MirrorballTag } from "../MirrorballTypes";

export class TagsService extends BaseService {
  async getTagsForArtists(artists: ArtistInput[]): Promise<MirrorballTag[]> {
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

    const response = await mirrorballClient.query<{
      tags: { tags: MirrorballTag[] };
    }>({ query, variables: { artists } });

    return response.data.tags.tags;
  }

  async getTagsForArtistsMap(
    artists: string[],
    requireTags = false
  ): Promise<{
    [artistName: string]: string[];
  }> {
    const query = gql`
      query artists($artists: [ArtistInput!]!, $requireTags: Boolean) {
        artists(inputs: $artists, requireTagsForMissing: $requireTags) {
          name
          tags
        }
      }
    `;

    const response = await mirrorballClient.query<{
      artists: { name: string; tags: string[] }[];
    }>({
      query,
      variables: {
        requireTags,
        artists: artists.map((a) => ({ name: a })),
      },
    });

    return response.data.artists.reduce((acc, val) => {
      acc[val.name] = val.tags;

      return acc;
    }, {} as { [artistName: string]: string[] });
  }

  async filter<T extends { name: string }>(
    artists: T[],
    allowedTags: string[]
  ): Promise<T[]> {
    allowedTags = allowedTags.map((t) => t.toLowerCase());

    const artistNames = artists.map((a) => a.name.toLowerCase());

    const tagMap = await this.getTagsForArtistsMap(artistNames);

    const filteredArtists = artists.filter((a) => {
      return (
        tagMap[a.name] && tagMap[a.name]?.some((t) => allowedTags.includes(t))
      );
    });

    return filteredArtists;
  }
}
