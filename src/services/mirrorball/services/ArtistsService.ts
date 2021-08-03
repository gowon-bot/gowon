import gql from "graphql-tag";
import { mirrorballClient } from "../../../lib/indexing/client";
import { BaseService } from "../../BaseService";
import { MirrorballArtist } from "../MirrorballTypes";

export class ArtistsService extends BaseService {
  async correctArtistNames(artistNames: string[]): Promise<string[]> {
    const artists = artistNames.map((a) => ({ name: a }));

    const query = gql`
      query correctArtists($artists: [ArtistInput!]!) {
        artists(inputs: $artists) {
          name
        }
      }
    `;

    const response = await mirrorballClient.query<{
      artists: MirrorballArtist[];
    }>({
      query,
      variables: { artists },
    });

    return artistNames.map(
      (a) =>
        response.data.artists.find(
          (ma) => a.toLowerCase() === ma.name.toLowerCase()
        )?.name || a
    );
  }
}
