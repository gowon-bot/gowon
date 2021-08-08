import gql from "graphql-tag";
import { BaseService } from "../BaseService";
import { RawArtistInfo, RawTagTopArtists } from "../LastFM/LastFMService.types";
import { MirrorballService } from "./MirrorballService";

export class MirrorballCacheService extends BaseService {
  private mirrorballService = new MirrorballService(this.logger);

  async cacheArtistInfo(artistInfo: RawArtistInfo) {
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

      await this.mirrorballService.mutate(mutation, {
        artist: artistInfo.name,
        tags,
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

      await this.mirrorballService.mutate(mutation, { tag, artists });
    } catch {}
  }
}
