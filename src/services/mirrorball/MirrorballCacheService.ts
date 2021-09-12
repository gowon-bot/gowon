import gql from "graphql-tag";
import { displayNumber } from "../../lib/views/displays";
import { BaseService, BaseServiceContext } from "../BaseService";
import { RawArtistInfo, RawTagTopArtists } from "../LastFM/LastFMService.types";
import { ServiceRegistry } from "../ServicesRegistry";
import { MirrorballService } from "./MirrorballService";

export class MirrorballCacheService extends BaseService {
  private get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
  }

  async cacheArtistInfo(ctx: BaseServiceContext, artistInfo: RawArtistInfo) {
    this.log(ctx, `Caching artist info for ${artistInfo.name} to Mirrorball`);

    try {
      const mutation = gql`
        mutation tagArtist($artist: String!, $tags: [TagInput!]!) {
          tagArtists(
            artists: [{ name: $artist }]
            tags: $tags
            markAsChecked: true
          )
        }
      `;

      const tags = artistInfo.tags.tag.map((t) => ({ name: t.name }));

      await this.mirrorballService.mutate(ctx, mutation, {
        artist: artistInfo.name,
        tags,
      });
    } catch {}
  }

  async cacheTagTopArtists(
    ctx: BaseServiceContext,
    tagTopArtists: RawTagTopArtists
  ) {
    this.log(
      ctx,
      `Caching ${displayNumber(tagTopArtists.artist.length, "artists")} as ${
        tagTopArtists["@attr"].tag
      } to Mirrorball`
    );

    try {
      const tag = tagTopArtists["@attr"].tag;
      const artists = tagTopArtists.artist.map((a) => ({ name: a.name }));

      const mutation = gql`
        mutation tagArtist($artists: [ArtistInput!]!, $tag: String!) {
          tagArtists(artists: $artists, tags: [{ name: $tag }])
        }
      `;

      await this.mirrorballService.mutate(ctx, mutation, { tag, artists });
    } catch {}
  }
}
