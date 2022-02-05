import gql from "graphql-tag";
import { GowonContext } from "../../../lib/context/Context";
import { displayNumber } from "../../../lib/views/displays";
import { BaseService } from "../../BaseService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { MirrorballService } from "../MirrorballService";
import { MirrorballArtist } from "../MirrorballTypes";

export class ArtistsService extends BaseService {
  get mirrorballService() {
    return ServiceRegistry.get(MirrorballService);
  }

  async correctArtistNames(
    ctx: GowonContext,
    artistNames: string[]
  ): Promise<string[]> {
    this.log(
      ctx,
      `Correcting artist names for ${displayNumber(
        artistNames.length,
        "artist"
      )}`
    );
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
    }>(ctx, query, { artists });

    return artistNames.map(
      (a) =>
        response.artists.find((ma) => a.toLowerCase() === ma.name.toLowerCase())
          ?.name || a
    );
  }
}
