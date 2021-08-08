import gql from "graphql-tag";
import { BaseService } from "../../BaseService";
import { MirrorballService } from "../MirrorballService";
import { MirrorballArtist } from "../MirrorballTypes";

export class ArtistsService extends BaseService {
  mirrorballService = new MirrorballService(this.logger);

  async correctArtistNames(artistNames: string[]): Promise<string[]> {
    const artists = artistNames.map((a) => ({ name: a }));

    const query = gql`
      query correctArtists($artists: [ArtistInput!]!) {
        artists(inputs: $artists) {
          name
        }
      }
    `;

    const response = await this.mirrorballService.query<{
      artists: MirrorballArtist[];
    }>(query, { artists });

    return artistNames.map(
      (a) =>
        response.artists.find((ma) => a.toLowerCase() === ma.name.toLowerCase())
          ?.name || a
    );
  }
}
