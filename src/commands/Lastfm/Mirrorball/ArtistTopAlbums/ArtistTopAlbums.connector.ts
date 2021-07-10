import { gql } from "apollo-server-express";
import { BaseConnector } from "../../../../lib/indexing/BaseConnector";
import {
  ArtistInput,
  UserInput,
} from "../../../../services/mirrorball/MirrorballTypes";

export interface ArtistTopAlbumsResponse {
  artistTopAlbums: {
    artist: {
      name: string;
    };

    topAlbums: {
      playcount: number;
      album: {
        name: string;
      };
    }[];
  };
}

export interface ArtistTopAlbumsParams {
  artist: ArtistInput;
  user: UserInput;
}

export class ArtistTopAlbumsConnector extends BaseConnector<
  ArtistTopAlbumsResponse,
  ArtistTopAlbumsParams
> {
  query = gql`
    query artistTopAlbums($artist: ArtistInput!, $user: UserInput!) {
      artistTopAlbums(artist: $artist, user: $user) {
        artist {
          name
        }

        topAlbums {
          playcount
          album {
            name
          }
        }
      }
    }
  `;
}
