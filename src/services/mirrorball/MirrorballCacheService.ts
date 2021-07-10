import gql from "graphql-tag";
import { mirrorballClient } from "../../lib/indexing/client";
import { BaseService } from "../BaseService";
import { RawArtistInfo, RawTagTopArtists } from "../LastFM/LastFMService.types";

export class MirrorballCacheService extends BaseService {
  async cacheArtistInfo(artistInfo: RawArtistInfo) {
    try {
      const mutation = gql`
        mutation tagArtist($artist: String!, $tags: [TagInput!]!) {
          tagArtists(artists: [{ name: $artist }], tags: $tags)
        }
      `;

      const tags = artistInfo.tags.tag.map((t) => ({ name: t.name }));

      await mirrorballClient.mutate({
        mutation,
        variables: { artist: artistInfo.name, tags },
      });
    } catch {}
  }

  async cacheTagTopArtists(tagTopArtists: RawTagTopArtists) {
    try {
      const tag = tagTopArtists["@attr"].tag;
      const artists = tagTopArtists.artist.map((a) => ({ name: a.name }));

      const mutation = gql`
        mutation tagArtist($artists: [ArtistInput!]!, $tag: String!) {
          tagArtists(artists: $artists, tags: [{ name: $tag }])
        }
      `;

      await mirrorballClient.mutate({ mutation, variables: { tag, artists } });
    } catch {}
  }
}
