import { gql } from "@apollo/client";
import { GowonContext } from "../../lib/context/Context";
import { displayNumber } from "../../lib/ui/displays";
import { RawArtistInfo, RawTagTopArtists } from "../LastFM/LastFMService.types";
import { ArtistInput } from "../mirrorball/MirrorballTypes";
import { LilacAPIService } from "./LilacAPIService";
import {
  LilacTag,
  LilacTagsFilters,
  LilacTagsPage,
} from "./LilacAPIService.types";

export class LilacTagsService extends LilacAPIService {
  async cacheArtistInfo(ctx: GowonContext, artistInfo: RawArtistInfo) {
    this.log(ctx, `Caching artist info for ${artistInfo.name} to Lilac`);

    try {
      const mutation = gql`
        mutation tagArtists($artists: [ArtistInput!]!, $tags: [TagInput!]!) {
          tagArtists(artists: $artists, tags: $tags, markAsChecked: true)
        }
      `;

      const tags = artistInfo.tags.tag.map((t) => ({ name: t.name }));

      await this.mutate(ctx, mutation, {
        artists: [{ name: artistInfo.name }],
        tags,
      });
    } catch {}
  }

  async cacheTagTopArtists(ctx: GowonContext, tagTopArtists: RawTagTopArtists) {
    this.log(
      ctx,
      `Caching ${displayNumber(tagTopArtists.artist.length, "artist")} as ${
        tagTopArtists["@attr"].tag
      } to Lilac`
    );

    try {
      const artists = tagTopArtists.artist.map((a) => ({ name: a.name }));

      const mutation = gql`
        mutation tagArtists($artists: [ArtistInput!]!, $tags: [TagInput!]!) {
          tagArtists(artists: $artists, tags: [{ name: $tag }])
        }
      `;

      await this.mutate(ctx, mutation, {
        tag: [{ name: tagTopArtists["@attr"].tag }],
        artists,
      });
    } catch {}
  }

  async list(
    ctx: GowonContext,
    filters: LilacTagsFilters
  ): Promise<LilacTagsPage> {
    this.log(ctx, `Fetching tags from Lilac`);

    const query = gql`
      query tags($filters: TagsFilters!) {
        tags(filters: $filters) {
          tags {
            name
            occurrences
          }
        }
      }
    `;

    const response = await this.query<
      {
        tags: LilacTagsPage;
      },
      { filters: LilacTagsFilters }
    >(ctx, query, { filters });

    return response.tags;
  }

  async getTagsForArtists(
    ctx: GowonContext,
    artists: ArtistInput[]
  ): Promise<LilacTag[]> {
    this.log(
      ctx,
      `Getting tags for ${displayNumber(artists.length, "artist")}`
    );

    const response = await this.list(ctx, { artists });

    return response.tags;
  }
}
